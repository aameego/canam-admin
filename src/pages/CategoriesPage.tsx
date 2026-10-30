import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import BusyOverlay, { BusyLabel } from '../components/BusyOverlay.tsx';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useProducts.ts';
import { adminCardActionClass } from '../lib/adminChrome.ts';
import { validateCategoryInput } from '../lib/products.ts';
import { getErrorMessage } from '../lib/getErrorMessage.ts';
import { routes } from '../routes.ts';

export default function CategoriesPage() {
  const query = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [busyId, setBusyId] = useState('');

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const parsed = validateCategoryInput(name, code);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    try {
      await create.mutateAsync({ name: parsed.name, code: parsed.code });
      setName('');
      setCode('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create this category.'));
    }
  };

  const onToggle = async (id: string, isActive: boolean) => {
    setError('');
    setBusyId(id);
    try {
      await update.mutateAsync({ id, body: { isActive: !isActive } });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this category.'));
    } finally {
      setBusyId('');
    }
  };

  const onDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete category “${label}”?`)) return;
    setError('');
    setBusyId(id);
    try {
      await remove.mutateAsync(id);
      if (editingId === id) setEditingId('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this category.'));
    } finally {
      setBusyId('');
    }
  };

  const startEdit = (id: string, currentName: string, currentCode: string) => {
    setError('');
    setEditingId(id);
    setEditName(currentName);
    setEditCode(currentCode);
  };

  const onSaveEdit = async (id: string) => {
    setError('');
    const parsed = validateCategoryInput(editName, editCode);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setBusyId(id);
    try {
      await update.mutateAsync({
        id,
        body: {
          name: parsed.name,
          ...(parsed.code ? { code: parsed.code } : {}),
        },
      });
      setEditingId('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this category.'));
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <Link to={routes.products} className="self-start cursor-pointer font-display text-[13px] font-bold text-navy hover:underline">
        ← Products
      </Link>
      <form onSubmit={onCreate} className="rounded-lg border border-line bg-white p-4 sm:p-6">
        <h2 className="font-display text-[16px] font-extrabold text-navy">Add category</h2>
        {error && (
          <p className="mt-3 font-body text-[13px] text-canam-red" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <input
            className="h-11 rounded-[6px] border border-line px-3 font-body text-[14px] outline-none focus:border-navy"
            placeholder="Category name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="h-11 rounded-[6px] border border-line px-3 font-body text-[14px] outline-none focus:border-navy"
            placeholder="Code (optional)"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button
            type="submit"
            disabled={create.isPending}
            className="h-11 cursor-pointer rounded-[6px] bg-canam-red px-4 font-display text-[13px] font-bold text-white transition-colors hover:bg-canam-red/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <BusyLabel pending={create.isPending} pendingLabel="Saving…" idle="Add" />
          </button>
        </div>
      </form>

      {query.isLoading && (
        <div className="relative min-h-48 rounded-lg border border-line bg-white">
          <BusyOverlay label="Loading categories…" />
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        {(query.data ?? []).map((category) => (
          <div key={category.id} className="flex flex-col gap-3 border-t border-line px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
            {editingId === category.id ? (
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_140px]">
                <input
                  className="h-11 rounded-[6px] border border-line px-3 font-body text-[14px] outline-none focus:border-navy"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  aria-label="Category name"
                />
                <input
                  className="h-11 rounded-[6px] border border-line px-3 font-body text-[14px] outline-none focus:border-navy"
                  value={editCode}
                  onChange={(event) => setEditCode(event.target.value)}
                  aria-label="Category code"
                />
              </div>
            ) : (
              <div className="min-w-0">
                <p className="font-display text-[14px] font-bold text-navy">{category.name}</p>
                <p className="font-body text-[13px] text-muted">
                  {category.code} · {category.count ?? 0} products · {category.isActive ? 'Active' : 'Hidden'}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {editingId === category.id ? (
                <>
                  <button
                    type="button"
                    className={adminCardActionClass('primary')}
                    onClick={() => void onSaveEdit(category.id)}
                    disabled={busyId === category.id}
                  >
                    <BusyLabel pending={busyId === category.id && update.isPending} pendingLabel="Saving…" idle="Save" />
                  </button>
                  <button
                    type="button"
                    className={`${adminCardActionClass()} px-3`}
                    onClick={() => setEditingId('')}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${adminCardActionClass()} px-3`}
                  onClick={() => startEdit(category.id, category.name, category.code)}
                >
                  Rename
                </button>
              )}
              <button
                type="button"
                className={`${adminCardActionClass()} px-3`}
                onClick={() => void onToggle(category.id, category.isActive)}
                disabled={busyId === category.id}
              >
                <BusyLabel
                  pending={busyId === category.id && update.isPending && editingId !== category.id}
                  pendingLabel="Updating…"
                  idle={category.isActive ? 'Hide' : 'Show'}
                />
              </button>
              <button
                type="button"
                className={`${adminCardActionClass('danger')} px-3`}
                onClick={() => void onDelete(category.id, category.name)}
                disabled={busyId === category.id}
              >
                <BusyLabel pending={busyId === category.id && remove.isPending} pendingLabel="Deleting…" idle="Delete" />
              </button>
            </div>
          </div>
        ))}
        {!query.isLoading && (query.data ?? []).length === 0 && (
          <p className="px-4 py-8 font-body text-[14px] text-muted">No categories yet.</p>
        )}
      </div>
    </section>
  );
}
