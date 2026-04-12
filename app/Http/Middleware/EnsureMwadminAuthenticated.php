<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMwadminAuthenticated
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $session = $request->session()->get('ishnews_session');
        $isValidated = is_array($session) && !empty($session['validated']);

        if (!$isValidated) {
            if ($request->is('api/mwadmin', 'api/mwadmin/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            return redirect()->route('mwadmin.login');
        }

        return $next($request);
    }
}