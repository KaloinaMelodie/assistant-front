import { useEffect, useMemo, useState } from "react"
import * as ui from "../bootstrap/bootstrap"
import PopoverHelpComponent from "../element/PopoverHelpComponent";

export default function Admins() {
  const base = import.meta.env.VITE_I18N_BASE || ""
  const url = `${base}/admins`

  // Liste / chargement
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState("")

  // Création
  const [newEmail, setNewEmail] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const canCreate = useMemo(() => (newEmail?.trim() || newUsername?.trim()), [newEmail, newUsername])

  // Édition inline
  const [editingId, setEditingId] = useState(null)
  const [editEmail, setEditEmail] = useState("")
  const [editUsername, setEditUsername] = useState("")

  // Alertes (BadRequest uniquement) + validation email
  const [showAlert, setShowAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState("")
  const [alertEmailMsg, setAlertEmailMsg] = useState("")
  const showBadRequest = (msg) => { setAlertMsg(msg || "Requête invalide"); setShowAlert(true) }

  // Recherche + debounce
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // Pagination (client-side)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Email simple check
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Fetch list (avec filtre q). keepPage=true pour bouton Actualiser (ne pas casser la page courante)
  const fetchList = async (opt = { keepPage: false }) => {
    setLoading(true)
    setLoadErr("")
    try {
      const params = new URLSearchParams()
      if (debouncedQuery) params.set("q", debouncedQuery)

      const res = await fetch(`${url}?${params.toString()}`, {
        headers: { "Accept": "application/json" },
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)

      // tri stable: email puis username
      data.sort((a, b) => (a.email || "").localeCompare(b.email || "", "fr") || (a.username || "").localeCompare(b.username || "", "fr"))
      setItems(data)

      // Quand la recherche change, on repart en page 1
      if (!opt.keepPage) setPage(1)
    } catch (e) {
      setLoadErr("Impossible de charger la liste des admins")
    } finally {
      setLoading(false)
    }
  }

  // Initial
  useEffect(() => { fetchList() }, [])

  // Quand le filtre (debounced) change → recharge + reset page (géré dans fetchList)
  useEffect(() => { fetchList() }, [debouncedQuery])

  // Si on change la taille de page → revenir à la première page
  useEffect(() => { setPage(1) }, [pageSize])

  // Fenêtrage client
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const clampedPage = Math.min(page, pageCount)
  const startIdx = (clampedPage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, total)
  const paged = items.slice(startIdx, endIdx)

  // Création
  const handleCreate = async () => {
    if (!canCreate) return
    setShowAlert(false); setAlertMsg(""); setAlertEmailMsg("")

    if (newEmail?.trim() && !isValidEmail(newEmail.trim())) {
      setAlertEmailMsg("L'adresse email saisie est invalide.")
      return
    }
    try {
      const body = {}
      if (newEmail?.trim()) body.email = newEmail.trim()
      if (newUsername?.trim()) body.username = newUsername.trim()

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 400) showBadRequest(data?.message || "Requête invalide")
        return
      }
      setNewEmail(""); setNewUsername("")
      await fetchList({ keepPage: true }) // reste sur la page
    } catch (e) { /* réseau */ }
  }

  const startEdit = (it) => {
    setEditingId(it.id)
    setEditEmail(it.email || "")
    setEditUsername(it.username || "")
    setShowAlert(false); setAlertMsg(""); setAlertEmailMsg("")
  }
  const cancelEdit = () => { setEditingId(null); setEditEmail(""); setEditUsername("") }

  const saveEdit = async (id) => {
    const body = {}
    if (editEmail !== null && editEmail.length != 0) body.email = (editEmail ).trim()
    if (editUsername !== null && editUsername.length != 0) body.username = (editUsername ).trim()

    setShowAlert(false); setAlertMsg(""); setAlertEmailMsg("")
    if (editEmail?.trim() && !isValidEmail(editEmail.trim())) {
      setAlertEmailMsg("L'adresse email modifiée est invalide.")
      return
    }
    try {
      const res = await fetch(`${url}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 400) showBadRequest(data?.message || "Requête invalide")
        return
      }
      cancelEdit()
      await fetchList({ keepPage: true })
    } catch (e) { }
  }

  // Suppression
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet admin ?")) return
    setShowAlert(false); setAlertMsg("")
    try {
      const res = await fetch(`${url}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 400) showBadRequest(data?.message || "Requête invalide")
        return
      }
      // si on supprime le dernier de la page, reculer d’une page si possible
      const wasLastOfPage = endIdx - startIdx === 1 && clampedPage > 1
      if (wasLastOfPage) setPage(clampedPage - 1)
      await fetchList({ keepPage: true })
    } catch (e) { /* réseau */ }
  }

  return (
    <div className="container py-4">
      <h3 className="mb-1">
        Gestion des admins
      </h3>

      {showAlert && (
        <ui.Alert variant="danger" dismissible onClose={() => setShowAlert(false)}>
          {alertMsg}
        </ui.Alert>
      )}

      {alertEmailMsg && (
        <ui.Alert variant="danger" dismissible onClose={() => setAlertEmailMsg("")}>
          {alertEmailMsg}
        </ui.Alert>
      )}

      {/* Création */}
      <section className="card mb-3">
        <div className="card-body">
          <h4 className="h5">
            Ajouter un admin{" "}
            <small>
              <PopoverHelpComponent>
                Renseigne email ou username. Un seul suffit.
              </PopoverHelpComponent>
            </small>
          </h4>

          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={newEmail}
                placeholder="alice@ex.com"
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={newUsername}
                placeholder="username"
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary mt-3 mt-md-0"
                onClick={handleCreate}
                disabled={!canCreate}
                title={canCreate ? "" : "Saisis au moins email ou username"}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Liste + Recherche + Pagination */}
      <section className="card">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="h5 mb-0">Liste des admins</h4>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Recherche (debounce + Enter) */}
              <div className="input-group">
                <span className="input-group-text"><i className="fa fa-search" /></span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Rechercher …"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setDebouncedQuery(query.trim())
                  }}
                />
              </div>

              {/* <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => fetchList({ keepPage: true })}
                disabled={loading}
              >
                Actualiser
              </button> */}
            </div>
          </div>

          {loadErr && (<div className="alert alert-warning">{loadErr}</div>)}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Email</th>
                  <th style={{ width: "30%" }}>Username</th>
                  <th style={{ width: "20%" }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((it) => {
                  const isEditing = editingId === it.id
                  return (
                    <tr key={it.id}>
                      <td>
                        {isEditing ? (
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="alice@ex.com"
                          />
                        ) : (
                          <span>{it.email || <span className="text-muted">—</span>}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="username"
                          />
                        ) : (
                          <span>{it.username || <span className="text-muted">—</span>}</span>
                        )}
                      </td>
                   
                      <td className="text-end">
                        {!isEditing ? (
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => startEdit(it)}
                            >
                              Éditer
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(it.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        ) : (
                          <div className="btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => saveEdit(it.id)}
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={cancelEdit}
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {(!paged || paged.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      {loading ? "Chargement…" : "Aucun admin pour le moment"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination + info + page size */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="text-muted small">
              {total > 0 ? `${startIdx + 1}–${endIdx} sur ${total}` : "0 résultat"}
            </div>

            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0">Par page</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 90 }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${clampedPage <= 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Précédent
                    </button>
                  </li>

                  {Array.from({ length: Math.min(pageCount, 7) }).map((_, i) => {
                    const num = i + 1
                    return (
                      <li key={num} className={`page-item ${num === clampedPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(num)}>{num}</button>
                      </li>
                    )
                  })}

                  {pageCount > 7 && <li className="page-item disabled"><span className="page-link">…</span></li>}

                  <li className={`page-item ${clampedPage >= pageCount ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.min(pageCount, p + 1))}>
                      Suivant
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
