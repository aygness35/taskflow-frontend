import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CalendarDays,
  MessageSquare,
  Send,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import { api, getAll } from './api';
import { Avatar, ErrorBox, Modal, SaveButton, Spinner } from './components';
import { dateLabel, inputDate, priorities, statuses } from './types';
import type {
  Comment,
  Member,
  Priority,
  Role,
  Status,
  Task,
  User,
} from './types';
export function TaskDialog({
  task,
  defaultStatus = 'TODO',
  projectId,
  members,
  user,
  role,
  onClose,
  onSaved,
}: {
  task?: Task;
  defaultStatus?: Status;
  projectId: string;
  members: Member[];
  user: User;
  role: Role;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<Status>(task?.status || defaultStatus);
  const [priority, setPriority] = useState<Priority>(
    task?.priority || 'MEDIUM',
  );
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? inputDate(task.dueDate) : '',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(!!task);
  const [editing, setEditing] = useState<string | null>(null);
  const [commentDelete, setCommentDelete] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!task) return;
    const controller = new AbortController();
    setCommentsLoading(true);
    getAll<Comment>(`/tasks/${task.id}/comments`, controller.signal)
      .then(setComments)
      .catch((e) => {
        if (e.name !== 'AbortError') setCommentError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCommentsLoading(false);
      });
    return () => controller.abort();
  }, [task, reload]);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(task ? `/tasks/${task.id}` : `/projects/${projectId}/tasks`, {
        method: task ? 'PATCH' : 'POST',
        body: {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          assigneeId: assigneeId || null,
          dueDate: dueDate
            ? task?.dueDate && inputDate(task.dueDate) === dueDate
              ? task.dueDate
              : new Date(`${dueDate}T23:59:59`).toISOString()
            : null,
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!task) return;
    setBusy(true);
    setError('');
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE' });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submitComment(e: FormEvent) {
    e.preventDefault();
    setCommentBusy(true);
    setCommentError('');
    try {
      await api(
        editing ? `/comments/${editing}` : `/tasks/${task!.id}/comments`,
        {
          method: editing ? 'PATCH' : 'POST',
          body: { content: commentText.trim() },
        },
      );
      setCommentText('');
      setEditing(null);
      setReload((n) => n + 1);
    } catch (e) {
      setCommentError((e as Error).message);
    } finally {
      setCommentBusy(false);
    }
  }
  async function deleteComment(id: string) {
    setCommentBusy(true);
    setCommentError('');
    try {
      await api(`/comments/${id}`, { method: 'DELETE' });
      setCommentDelete(null);
      if (editing === id) {
        setEditing(null);
        setCommentText('');
      }
      setReload((n) => n + 1);
    } catch (e) {
      setCommentError((e as Error).message);
    } finally {
      setCommentBusy(false);
    }
  }
  const canDelete =
    !!task && (role !== 'MEMBER' || task.createdById === user.id);
  return (
    <Modal
      title={task ? 'Görev detayları' : 'Yeni bir adım ekle'}
      subtitle={
        task
          ? `TF-${task.id.slice(0, 4).toUpperCase()} · ${dateLabel(task.createdAt)} tarihinde oluşturuldu`
          : 'İyi tanımlanmış bir görev, işin yarısıdır.'
      }
      onClose={() => {
        if (!busy && !commentBusy) onClose();
      }}
      wide
    >
      <div className="task-dialog-layout">
        <form onSubmit={save} className="task-form">
          <label>
            Görev başlığı
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={3}
              maxLength={150}
              required
              placeholder="Ne yapılması gerekiyor?"
            />
          </label>
          <label>
            Açıklama <span className="optional">isteğe bağlı</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              placeholder="Bağlamı, beklentileri ve küçük detayları paylaş…"
            />
          </label>
          <div className="form-grid">
            <label>
              Durum
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Öncelik
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {Object.entries(priorities).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sorumlu
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Henüz atanmadı</option>
                {members.map((m) => (
                  <option key={m.id} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <CalendarDays size={13} /> Son tarih
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={!task ? new Date().toLocaleDateString('en-CA') : undefined}
              />
            </label>
          </div>
          {error && <ErrorBox message={error} />}
          {confirmDelete && (
            <div className="delete-confirm">
              <p>Bu görev ve tüm yorumları kalıcı olarak silinecek.</p>
              <div>
                <button
                  type="button"
                  className="button danger"
                  disabled={busy}
                  onClick={remove}
                >
                  Evet, görevi sil
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setConfirmDelete(false)}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
          <footer className="form-footer">
            {canDelete ? (
              <button
                type="button"
                className="text-button danger-text"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} /> Görevi sil
              </button>
            ) : (
              <span />
            )}
            <SaveButton busy={busy}>
              {task ? 'Değişiklikleri kaydet' : 'Görev oluştur'}
            </SaveButton>
          </footer>
        </form>
        {task && (
          <section className="comments-panel">
            <h3>
              <MessageSquare size={17} /> Ekip konuşması{' '}
              <span>{comments.length}</span>
            </h3>
            {commentsLoading ? (
              <Spinner />
            ) : (
              <div className="comment-list">
                {!comments.length && (
                  <p className="muted">
                    Henüz yorum yok. İlk düşünceni paylaş.
                  </p>
                )}
                {comments.map((c) => {
                  const author =
                    members.find((m) => m.userId === c.authorId)?.user.name ||
                    (c.authorId === user.id ? user.name : 'Eski ekip üyesi');
                  return (
                    <article className="comment" key={c.id}>
                      <div className="comment-top">
                        <Avatar name={author} small />
                        <strong>{author}</strong>
                        <time>{dateLabel(c.createdAt)}</time>
                      </div>
                      <p>{c.content}</p>
                      <div className="comment-actions">
                        {c.authorId === user.id && (
                          <button
                            className="text-button"
                            disabled={commentBusy}
                            onClick={() => {
                              setEditing(c.id);
                              setCommentText(c.content);
                            }}
                          >
                            <Pencil size={12} /> Düzenle
                          </button>
                        )}
                        {(c.authorId === user.id || role !== 'MEMBER') && (
                          <button
                            className="text-button"
                            disabled={commentBusy}
                            onClick={() => setCommentDelete(c.id)}
                          >
                            <Trash2 size={12} /> Sil
                          </button>
                        )}
                      </div>
                      {commentDelete === c.id && (
                        <div className="inline-confirm">
                          Yorum silinsin mi?
                          <button
                            className="text-button danger-text"
                            disabled={commentBusy}
                            onClick={() => deleteComment(c.id)}
                          >
                            Sil
                          </button>
                          <button
                            className="text-button"
                            onClick={() => setCommentDelete(null)}
                          >
                            Vazgeç
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            {commentError && (
              <ErrorBox
                message={commentError}
                retry={() => {
                  setCommentError('');
                  setReload((n) => n + 1);
                }}
              />
            )}
            <form onSubmit={submitComment} className="comment-compose">
              {editing && (
                <div className="editing-label">
                  Yorum düzenleniyor
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Düzenlemeyi iptal et"
                    onClick={() => {
                      setEditing(null);
                      setCommentText('');
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              <textarea
                aria-label="Yorumun"
                placeholder="Ekibinle bir not paylaş…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                maxLength={2000}
                rows={3}
              />
              <button
                className="button"
                disabled={commentBusy || !commentText.trim()}
              >
                <Send size={14} />
                {editing ? 'Yorumu güncelle' : 'Gönder'}
              </button>
            </form>
          </section>
        )}
      </div>
    </Modal>
  );
}
