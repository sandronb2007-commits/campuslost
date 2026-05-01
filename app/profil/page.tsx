'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Laporan = {
  id: string
  jenis: string
  judul: string
  lokasi: string
  kategori: string
  status: string
  created_at: string
}

export default function ProfilPage() {
  const [email, setEmail] = useState('')
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setEmail(user.email ?? '')

    const { data } = await supabase
      .from('laporan')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setLaporan(data)
    setLoading(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleHapus(id: string) {
    const supabase = createClient()
    await supabase.from('laporan').delete().eq('id', id)
    setLaporan(laporan.filter(item => item.id !== id))
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">CampusLost</Link>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{email}</h2>
              <p className="text-gray-500 text-sm">{laporan.length} laporan dibuat</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700">Laporan Saya</h3>
          <Link
            href="/lapor"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Buat Laporan
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Memuat...</p>
        ) : laporan.length === 0 ? (
          <p className="text-center text-gray-400">Belum ada laporan.</p>
        ) : (
          <div className="grid gap-4">
            {laporan.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{item.judul}</h4>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.jenis === 'hilang' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {item.jenis === 'hilang' ? 'Hilang' : 'Temuan'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  <span>{item.lokasi}</span>
                  <span>-</span>
                  <span>{item.kategori}</span>
                  <span>-</span>
                  <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <button
                  onClick={() => handleHapus(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Hapus laporan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}