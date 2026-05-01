'use client'

import { useEffect, useState } from 'react'
import { createClient } from './utils/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Laporan = {
  id: string
  jenis: string
  judul: string
  deskripsi: string
  lokasi: string
  kategori: string
  kontak_wa: string
  status: string
  created_at: string
}

export default function Home() {
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('semua')
  const [filterJenis, setFilterJenis] = useState('semua')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchLaporan()
    checkUser()
  }, [])

  async function checkUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserEmail(user.email ?? null)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserEmail(null)
    router.refresh()
  }

  async function fetchLaporan() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('laporan')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setLaporan(data)
    setLoading(false)
  }

  const filtered = laporan.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase())
    const matchKategori = filterKategori === 'semua' || item.kategori === filterKategori
    const matchJenis = filterJenis === 'semua' || item.jenis === filterJenis
    return matchSearch && matchKategori && matchJenis
  })

  return (
    <main className="min-h-screen bg-blue-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-700">CampusLost</h1>
        <div className="flex gap-3 items-center">
          {userEmail ? (
            <>
              <Link href="/profil" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                👤 {userEmail}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
              >
                Logout
              </button>
              <Link href="/lapor" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                + Buat Laporan
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link href="/lapor" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                + Buat Laporan
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Cari Barang Hilang dan Temuan</h2>
          <p className="text-gray-500">Platform pelaporan barang hilang khusus mahasiswa kampus</p>
        </div>

        <input
          type="text"
          placeholder="Cari laporan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-5 py-3 mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
        />

        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="semua">Semua Jenis</option>
            <option value="hilang">Hilang</option>
            <option value="temuan">Temuan</option>
          </select>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="semua">Semua Kategori</option>
            <option value="elektronik">Elektronik</option>
            <option value="dompet">Dompet / Uang</option>
            <option value="kartu">Kartu / Identitas</option>
            <option value="tas">Tas</option>
            <option value="kunci">Kunci</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Memuat laporan...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">Tidak ada laporan ditemukan.</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{item.judul}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.jenis === 'hilang' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {item.jenis === 'hilang' ? 'Hilang' : 'Temuan'}
                  </span>
                </div>
                {item.foto_url && (
                <img
                  src={item.foto_url}
                  alt={item.judul}
                  className="w-full max-h-40 object-cover object-center rounded-lg mb-3 max-w-sm mx-auto block"
                />
                )}
                <p className="text-gray-500 text-sm mb-3">{item.deskripsi}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  <span>{item.lokasi}</span>
                  <span>-</span>
                  <span>{item.kategori}</span>
                  <span>-</span>
                  <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <a
                  href={`https://wa.me/${item.kontak_wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Hubungi via WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}