'use client'

import { useState } from 'react'
import { createClient } from '../utils/supabase'
import { useRouter } from 'next/navigation'

export default function LaporPage() {
  const [jenis, setJenis] = useState('hilang')
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [kategori, setKategori] = useState('elektronik')
  const [kontakWa, setKontakWa] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('❌ Kamu harus login dulu!')
      setLoading(false)
      return
    }

    let fotoUrl = null

    if (foto) {
      const fileName = `${user.id}-${Date.now()}-${foto.name}`
      const { error: uploadError } = await supabase.storage
        .from('foto-laporan')
        .upload(fileName, foto)

      if (uploadError) {
        setMessage('❌ Gagal upload foto: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('foto-laporan')
        .getPublicUrl(fileName)

      fotoUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('laporan').insert({
      user_id: user.id,
      jenis,
      judul,
      deskripsi,
      lokasi,
      kategori,
      kontak_wa: kontakWa,
      foto_url: fotoUrl,
      status: 'aktif'
    })

    if (error) {
      setMessage('❌ Gagal menyimpan: ' + error.message)
    } else {
      setMessage('✅ Laporan berhasil disimpan!')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Buat Laporan
        </h1>

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Jenis Laporan
        </label>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setJenis('hilang')}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${
              jenis === 'hilang'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-red-500 border-red-300'
            }`}
          >
            Barang Hilang
          </button>
          <button
            onClick={() => setJenis('temuan')}
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${
              jenis === 'temuan'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-green-500 border-green-300'
            }`}
          >
            Barang Temuan
          </button>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-1">Judul</label>
        <input
          type="text"
          placeholder="Contoh: Dompet hitam hilang di kantin"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="elektronik">Elektronik</option>
          <option value="dompet">Dompet / Uang</option>
          <option value="kartu">Kartu / Identitas</option>
          <option value="tas">Tas</option>
          <option value="kunci">Kunci</option>
          <option value="lainnya">Lainnya</option>
        </select>

        <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
        <input
          type="text"
          placeholder="Contoh: Kantin gedung A"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
        <textarea
          placeholder="Jelaskan ciri-ciri barang secara detail..."
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor WhatsApp</label>
        <input
          type="text"
          placeholder="Contoh: 08123456789"
          value={kontakWa}
          onChange={(e) => setKontakWa(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Foto Barang (opsional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Preview foto:</p>
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Kirim Laporan'}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </main>
  )
}