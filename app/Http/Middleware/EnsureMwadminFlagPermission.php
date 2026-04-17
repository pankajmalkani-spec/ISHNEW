<?php

namespace App\Http\Middleware;

use App\Services\MwadminAccessService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMwadminFlagPermission
{
    public function __construct(
        private readonly MwadminAccessService $accessService,
    ) {}

    /**
     * @param  string  $module  access_modules.modulename (e.g. category, dashboard)
     * @param  string  $flag    access_role_modules flag (e.g. allow_view, allow_add, allow_edit)
     */
    public function handle(
        Request $request,
        Closure $next,
        string $module,
        string $flag
    ): Response|RedirectResponse|JsonResponse {
        $session = $request->session()->get('ishnews_session');
        if (! is_array($session) || empty($session['validated'])) {
            if ($request->is('api/mwadmin', 'api/mwadmin/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            return redirect()->route('mwadmin.login');
        }

        if (empty($session['modules'])) {
            $session = $this->accessService->mergeModulesIntoSession($session);
            $request->session()->put('ishnews_session', $session);
        }

        if (! empty($session['superaccess'])) {
            return $next($request);
        }

        $modules = $session['modules'] ?? [];
        $flags = $modules[$module] ?? null;
        $allowed = is_array($flags) && ! empty($flags[$flag]);

        if ($allowed) {
            return $next($request);
        }

        if ($request->is('api/mwadmin', 'api/mwadmin/*') || $request->expectsJson()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return redirect()
            ->route('mwadmin.access_denied')
            ->with('error', 'You do not have access to that action.');
    }
}
