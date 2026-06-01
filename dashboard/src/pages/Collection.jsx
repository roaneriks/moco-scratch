import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const PINK = '#E4007B'

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E4007B]/30 focus:border-[#E4007B]'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#E4007B]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm z-50">
      {message}
    </div>
  )
}

function ConfirmDialog({ title, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
        <p className="text-sm text-gray-700 mb-6">
          Delete <span className="font-semibold">"{title}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────

export default function Collection() {
  const [view, setView] = useState('list')
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null) // artwork row from list, or null for new
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true)
    const { data } = await supabase
      .from('artworks')
      .select('id, title, year, is_active, artists(name)')
      .order('grid_position')
    setArtworks(data ?? [])
    setLoading(false)
  }

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  async function toggleActive(artwork) {
    const next = !artwork.is_active
    setArtworks(prev => prev.map(a => a.id === artwork.id ? { ...a, is_active: next } : a))
    await supabase.from('artworks').update({ is_active: next }).eq('id', artwork.id)
  }

  async function handleSave() {
    await fetchList()
    setView('list')
    showToast('Artwork saved')
  }

  async function handleDelete(artworkId) {
    await supabase.from('artworks').delete().eq('id', artworkId)
    await fetchList()
    setView('list')
    showToast('Artwork deleted')
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} />}
      {view === 'list' ? (
        <ListView
          artworks={artworks}
          loading={loading}
          onNew={() => { setEditTarget(null); setView('edit') }}
          onEdit={artwork => { setEditTarget(artwork); setView('edit') }}
          onToggle={toggleActive}
        />
      ) : (
        <EditView
          artworkId={editTarget?.id ?? null}
          onSave={handleSave}
          onCancel={() => setView('list')}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

// ── LIST VIEW ──────────────────────────────────────────────────────────────────

function ListView({ artworks, loading, onNew, onEdit, onToggle }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Collection</h1>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-[#E4007B] text-white text-sm font-medium rounded-lg hover:bg-[#c4006a] transition-colors"
        >
          + New artwork
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Artist
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">
                Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">
                Active
              </th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-10" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-9 bg-gray-100 rounded-full animate-pulse" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : artworks.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No artworks yet
                  </td>
                </tr>
              )
              : artworks.map(artwork => (
                  <tr key={artwork.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{artwork.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {artwork.artists?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">{artwork.year}</td>
                    <td className="px-4 py-3">
                      <Toggle checked={artwork.is_active ?? false} onChange={() => onToggle(artwork)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEdit(artwork)}
                        className="text-xs font-medium text-[#E4007B] hover:text-[#c4006a] transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── EDIT / CREATE VIEW ────────────────────────────────────────────────────────

function EditView({ artworkId, onSave, onCancel, onDelete }) {
  const isNew = artworkId === null

  // Basics
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Artist
  const [artistId, setArtistId] = useState(null)
  const [artistQuery, setArtistQuery] = useState('')
  const [artistName, setArtistName] = useState('')
  const [artistBirthplace, setArtistBirthplace] = useState('')
  const [artistBornYear, setArtistBornYear] = useState('')
  const [artistDiedYear, setArtistDiedYear] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestTimer = useRef(null)

  // Description
  const [description, setDescription] = useState('')

  // Materials
  const [materials, setMaterials] = useState([])
  const [newMaterial, setNewMaterial] = useState('')
  const [addingMaterial, setAddingMaterial] = useState(false)

  // Location
  const [locationId, setLocationId] = useState(null)
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [creationPeriod, setCreationPeriod] = useState('')

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (!isNew) fetchArtwork()
  }, [artworkId])

  async function fetchArtwork() {
    setLoading(true)
    const { data } = await supabase
      .from('artworks')
      .select('*, artists(*), artwork_materials(*), artwork_locations(*)')
      .eq('id', artworkId)
      .single()

    if (data) {
      setTitle(data.title ?? '')
      setYear(data.year ?? '')
      setIsActive(data.is_active ?? true)
      setDescription(data.description ?? '')

      const a = data.artists
      if (a) {
        setArtistId(a.id)
        setArtistName(a.name ?? '')
        setArtistQuery(a.name ?? '')
        setArtistBirthplace(a.birthplace ?? '')
        setArtistBornYear(a.born_year != null ? String(a.born_year) : '')
        setArtistDiedYear(a.died_year != null ? String(a.died_year) : '')
      }

      setMaterials((data.artwork_materials ?? []).map(m => ({ id: m.id, label: m.label })))

      const loc = data.artwork_locations?.[0]
      if (loc) {
        setLocationId(loc.id)
        setCity(loc.city ?? '')
        setCountry(loc.country ?? '')
        setCreationPeriod(loc.creation_period ?? '')
      }
    }
    setLoading(false)
  }

  // Artist autocomplete
  function handleArtistInput(val) {
    setArtistQuery(val)
    setArtistName(val)
    setArtistId(null)
    clearTimeout(suggestTimer.current)
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    suggestTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('artists')
        .select('id, name, birthplace, born_year, died_year')
        .ilike('name', `%${val}%`)
        .limit(6)
      setSuggestions(data ?? [])
      setShowSuggestions(true)
    }, 250)
  }

  function selectArtist(a) {
    setArtistId(a.id)
    setArtistName(a.name)
    setArtistQuery(a.name)
    setArtistBirthplace(a.birthplace ?? '')
    setArtistBornYear(a.born_year != null ? String(a.born_year) : '')
    setArtistDiedYear(a.died_year != null ? String(a.died_year) : '')
    setSuggestions([])
    setShowSuggestions(false)
  }

  function addMaterial() {
    const label = newMaterial.trim()
    if (!label) return
    setMaterials(prev => [...prev, { id: null, label }])
    setNewMaterial('')
    setAddingMaterial(false)
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      // 1. Upsert artist
      let resolvedArtistId = artistId
      if (!resolvedArtistId && artistName.trim()) {
        const { data: created } = await supabase
          .from('artists')
          .insert({
            name: artistName.trim(),
            birthplace: artistBirthplace.trim() || null,
            born_year: artistBornYear ? parseInt(artistBornYear) : null,
            died_year: artistDiedYear ? parseInt(artistDiedYear) : null,
          })
          .select('id')
          .single()
        resolvedArtistId = created?.id
      } else if (artistId) {
        await supabase.from('artists').update({
          name: artistName.trim(),
          birthplace: artistBirthplace.trim() || null,
          born_year: artistBornYear ? parseInt(artistBornYear) : null,
          died_year: artistDiedYear ? parseInt(artistDiedYear) : null,
        }).eq('id', artistId)
      }

      // 2. Upsert artwork
      let savedId = artworkId
      if (isNew) {
        const { data: created } = await supabase
          .from('artworks')
          .insert({
            title: title.trim(),
            year: year.trim(),
            is_active: isActive,
            description: description.trim() || null,
            artist_id: resolvedArtistId,
            grid_position: 999,
          })
          .select('id')
          .single()
        savedId = created?.id
      } else {
        await supabase.from('artworks').update({
          title: title.trim(),
          year: year.trim(),
          is_active: isActive,
          description: description.trim() || null,
          artist_id: resolvedArtistId,
        }).eq('id', artworkId)
      }

      if (!savedId) throw new Error('no artwork id')

      // 3. Replace materials
      await supabase.from('artwork_materials').delete().eq('artwork_id', savedId)
      if (materials.length > 0) {
        await supabase.from('artwork_materials').insert(
          materials.map(m => ({
            artwork_id: savedId,
            label: m.label,
            icon_name: m.label.toLowerCase().replace(/\s+/g, '_'),
          }))
        )
      }

      // 4. Replace location
      await supabase.from('artwork_locations').delete().eq('artwork_id', savedId)
      if (city.trim() || country.trim()) {
        await supabase.from('artwork_locations').insert({
          artwork_id: savedId,
          city: city.trim() || '',
          country: country.trim() || '',
          creation_period: creationPeriod.trim() || null,
        })
      }

      onSave()
    } catch (e) {
      console.error('Save failed', e)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 bg-gray-100 rounded-xl animate-pulse w-48" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={title}
          onConfirm={() => { setConfirm(false); onDelete(artworkId) }}
          onCancel={() => setConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'New artwork' : 'Edit artwork'}
        </h1>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={() => setConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-5 py-2 bg-[#E4007B] text-white text-sm font-medium rounded-lg hover:bg-[#c4006a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Two-column form */}
      <div className="grid grid-cols-5 gap-6 items-start">

        {/* Left — Basics + Description + Materials */}
        <div className="col-span-3 space-y-5">

          {/* Basics */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Basics</h3>
            <Field label="Title">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Artwork title"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Year">
                <input
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 2003"
                  className={inputCls}
                />
              </Field>
              <Field label="Active">
                <div className="flex items-center h-9 gap-3">
                  <Toggle checked={isActive} onChange={() => setIsActive(v => !v)} />
                  <span className="text-sm text-gray-500">{isActive ? 'Visible in app' : 'Hidden'}</span>
                </div>
              </Field>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Description</h3>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write a short artwork description…"
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </section>

          {/* Materials */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Materials</h3>
            <div className="flex flex-wrap gap-2">
              {materials.map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {m.label}
                  <button
                    onClick={() => setMaterials(prev => prev.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-gray-600 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {addingMaterial ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addMaterial()
                      if (e.key === 'Escape') { setAddingMaterial(false); setNewMaterial('') }
                    }}
                    placeholder="e.g. spray paint"
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-[#E4007B]/30 focus:border-[#E4007B]"
                  />
                  <button
                    onClick={addMaterial}
                    className="text-xs font-medium text-[#E4007B] hover:text-[#c4006a]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingMaterial(false); setNewMaterial('') }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingMaterial(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-400 hover:border-[#E4007B] hover:text-[#E4007B] transition-colors"
                >
                  + Add
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Right — Artist + Location */}
        <div className="col-span-2 space-y-5">

          {/* Artist */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Artist</h3>

            <div className="relative">
              <Field label="Name">
                <input
                  value={artistQuery}
                  onChange={e => handleArtistInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search or create artist…"
                  className={inputCls}
                />
              </Field>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map(a => (
                    <button
                      key={a.id}
                      onMouseDown={() => selectArtist(a)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {a.name}
                      {a.born_year && (
                        <span className="text-xs text-gray-400 ml-2">b. {a.born_year}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Field label="Birthplace">
              <input
                value={artistBirthplace}
                onChange={e => setArtistBirthplace(e.target.value)}
                placeholder="City, Country"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Born">
                <input
                  value={artistBornYear}
                  onChange={e => setArtistBornYear(e.target.value)}
                  placeholder="e.g. 1960"
                  type="number"
                  className={inputCls}
                />
              </Field>
              <Field label="Died (optional)">
                <input
                  value={artistDiedYear}
                  onChange={e => setArtistDiedYear(e.target.value)}
                  placeholder="—"
                  type="number"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Location</h3>
            <Field label="City">
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Barcelona"
                className={inputCls}
              />
            </Field>
            <Field label="Country">
              <input
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. Spain"
                className={inputCls}
              />
            </Field>
            <Field label="Creation period">
              <input
                value={creationPeriod}
                onChange={e => setCreationPeriod(e.target.value)}
                placeholder="e.g. ~ 3 months"
                className={inputCls}
              />
            </Field>
          </section>
        </div>
      </div>
    </>
  )
}
