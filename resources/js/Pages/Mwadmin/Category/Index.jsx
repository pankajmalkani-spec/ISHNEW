import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { createPortal } from 'react-dom';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import MwadminActionsDropdown from '../../../Components/Mwadmin/MwadminActionsDropdown';
import MwadminStatusBadge from '../../../Components/Mwadmin/MwadminStatusBadge';
import MwadminThemedAgGrid from '../../../Components/Mwadmin/MwadminThemedAgGrid';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';
import { canAdd, canDelete, canEdit, canViewDetail } from '../../../lib/mwadminPermissions';

const listingImageWrapStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    padding: '4px 0',
};

const listingImageStyle = {
    width: '60px',
    height: '36px',
    objectFit: 'cover',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const listingImagePopupStyle = {
    position: 'fixed',
    zIndex: 9999,
    width: '220px',
    height: '132px',
    padding: '8px',
    borderRadius: '10px',
    background: 'rgba(15, 23, 42, 0.96)',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
};

const listingImagePopupImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px',
    display: 'block',
};

function ListingImageCell({ src, alt = '' }) {
    const [previewPos, setPreviewPos] = useState(null);
    const updatePreviewPos = (event) => {
        const gap = 18;
        const width = 236;
        const height = 148;
        const left =
            event.clientX + gap + width > window.innerWidth
                ? Math.max(12, event.clientX - width - gap)
                : event.clientX + gap;
        const top =
            event.clientY + gap + height > window.innerHeight
                ? Math.max(12, event.clientY - height - gap)
                : event.clientY + gap;
        setPreviewPos({ left, top });
    };

    return (
        <div style={listingImageWrapStyle}>
            <img
                src={src}
                style={listingImageStyle}
                alt={alt}
                onMouseEnter={updatePreviewPos}
                onMouseMove={updatePreviewPos}
                onMouseLeave={() => setPreviewPos(null)}
            />
            {previewPos
                ? createPortal(
                      <div style={{ ...listingImagePopupStyle, left: previewPos.left, top: previewPos.top }}>
                          <img src={src} style={listingImagePopupImgStyle} alt="" />
                      </div>,
                      document.body
                  )
                : null}
        </div>
    );
}

export default function CategoryIndex({ authUser = {} }) {
    const dialog = useClassicDialog();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [columnFilters, setColumnFilters] = useState({ code: '', title: '', status: '' });

    const perms = useMemo(
        () => ({
            view: canViewDetail(authUser, 'category'),
            edit: canEdit(authUser, 'category'),
            deactivate: canDelete(authUser, 'category'),
            add: canAdd(authUser, 'category'),
        }),
        [authUser]
    );

    const query = useMemo(() => {
        const params =
            perPage === 'all'
                ? { search, page: 1, per_page: 'all' }
                : { search, page, per_page: perPage };
        if (columnFilters.code.trim() !== '') {
            params.filter_code = columnFilters.code.trim();
        }
        if (columnFilters.title.trim() !== '') {
            params.filter_title = columnFilters.title.trim();
        }
        if (columnFilters.status !== '') {
            params.filter_status = columnFilters.status;
        }
        return params;
    }, [search, page, perPage, columnFilters]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/mwadmin/categories', { params: query });
            setRows(data.data || []);
            setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 });
        } catch (err) {
            dialog.toast(err?.response?.data?.message || 'Unable to load categories.', 'error');
        } finally {
            setLoading(false);
        }
    }, [query, dialog]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteRow = useCallback(
        async (id) => {
            if (
                !(await dialog.confirm(
                    'Mark this category as inactive? It will not be removed from the database.',
                    'Deactivate Category'
                ))
            ) {
                return;
            }
            try {
                await axios.delete(`/api/mwadmin/categories/${id}`);
                dialog.toast('Category has been marked as inactive.', 'success');
                await loadData();
            } catch (err) {
                const msg = err?.response?.data?.message || 'Unable to deactivate category.';
                dialog.toast(msg, 'error');
            }
        },
        [dialog, loadData]
    );

    const handleAction = useCallback(
        async (id, action) => {
            if (!action) return;
            if (action === 'view') return window.location.assign(`/mwadmin/category/${id}/view`);
            if (action === 'edit') return window.location.assign(`/mwadmin/category/${id}/edit`);
            if (action === 'deactivate') await deleteRow(id);
        },
        [deleteRow]
    );

    const columns = useMemo(
        () => [
            { field: 'id', headerName: 'ID', width: 80, sortable: true },
            {
                field: 'actions',
                headerName: 'Actions',
                minWidth: 130,
                sortable: false,
                filter: false,
                cellRenderer: (params) => (
                    <MwadminActionsDropdown
                        flags={{
                            view: perms.view,
                            edit: perms.edit,
                            deactivate: perms.deactivate,
                        }}
                        onAction={(a) => handleAction(params.data.id, a)}
                    />
                ),
            },
            { field: 'code', headerName: 'Category Code', minWidth: 130, sortable: true },
            { field: 'title', headerName: 'Category Title', minWidth: 170, flex: 1, sortable: true },
            {
                field: 'color',
                headerName: 'Color',
                width: 110,
                cellRenderer: (params) => (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <input type="color" disabled value={params.value || '#ffffff'} />
                    </div>
                ),
            },
            {
                field: 'banner_img_url',
                headerName: 'Banner Image',
                minWidth: 110,
                cellRenderer: (params) => {
                    const src = params.value || '/images/categoryImages/bannerImages/no_img.gif';
                    return <ListingImageCell src={src} alt="Banner" />;
                },
            },
            {
                field: 'box_img_url',
                headerName: 'Box Image',
                minWidth: 110,
                cellRenderer: (params) => {
                    const src = params.value || '/images/categoryImages/boxImages/no_img.gif';
                    return <ListingImageCell src={src} alt="Box" />;
                },
            },
            { field: 'sort', headerName: 'Sort', width: 90, sortable: true },
            { field: 'total_records', headerName: 'Total Records', width: 120, sortable: true },
            {
                field: 'status',
                headerName: 'Status',
                minWidth: 110,
                cellRenderer: (params) => <MwadminStatusBadge value={params.value} />,
            },
        ],
        [handleAction, perms]
    );

    return (
        <>
            <Head title="Category Listing" />
            <MwadminLayout authUser={authUser} activeMenu="category">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Administration</span> <span className="sep">›</span> <span>Category</span>{' '}
                        <span className="sep">›</span> <strong>Category Listing</strong>
                    </div>
                    <h1 className="mwadmin-title">Category</h1>

                    <section className="mwadmin-panel">
                        <div className="mwadmin-toolbar">
                            <div>
                                Show
                                <select
                                    className="mwadmin-select"
                                    value={perPage === 'all' ? 'all' : String(perPage)}
                                    onChange={(e) => {
                                        setPage(1);
                                        const v = e.target.value;
                                        setPerPage(v === 'all' ? 'all' : Number(v));
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="mwadmin-right-tools">
                                {perms.add ? (
                                    <Link className="mwadmin-add-btn" href="/mwadmin/category/create">
                                        + Add New Category
                                    </Link>
                                ) : null}
                                <div className="mwadmin-search">
                                    Search:
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setPage(1);
                                            setSearch(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mwadmin-table-wrap">
                            <div className="mwadmin-filter-bar">
                                <input
                                    type="text"
                                    placeholder="Filter Category Code"
                                    value={columnFilters.code}
                                    onChange={(e) => {
                                        setPage(1);
                                        setColumnFilters((s) => ({ ...s, code: e.target.value }));
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Filter Category Title"
                                    value={columnFilters.title}
                                    onChange={(e) => {
                                        setPage(1);
                                        setColumnFilters((s) => ({ ...s, title: e.target.value }));
                                    }}
                                />
                                <select
                                    value={columnFilters.status}
                                    onChange={(e) => {
                                        setPage(1);
                                        setColumnFilters((s) => ({ ...s, status: e.target.value }));
                                    }}
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">In-Active</option>
                                </select>
                                <button
                                    type="button"
                                    className="mwadmin-filter-clear"
                                    onClick={() => {
                                        setPage(1);
                                        setColumnFilters({ code: '', title: '', status: '' });
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                            <MwadminThemedAgGrid>
                                <AgGridReact
                                    rowData={rows}
                                    columnDefs={columns}
                                    defaultColDef={{ resizable: true, sortable: true, filter: false }}
                                    suppressCellFocus
                                    rowHeight={46}
                                    headerHeight={42}
                                    overlayNoRowsTemplate={loading ? 'Loading...' : 'No data available in table'}
                                />
                            </MwadminThemedAgGrid>
                        </div>

                        <div className="mwadmin-pagination">
                            <span>
                                {perPage === 'all'
                                    ? `Showing all ${meta.total} record${meta.total === 1 ? '' : 's'}`
                                    : `Showing page ${meta.current_page} of ${meta.last_page} (${meta.total} records)`}
                            </span>
                            <div>
                                <button
                                    type="button"
                                    disabled={perPage === 'all' || page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    disabled={perPage === 'all' || page >= meta.last_page}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}
