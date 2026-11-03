const SUPABASE_URL = "MASUKKAN_PROJECT_URL";
const SUPABASE_KEY = "MASUKKAN_PUBLISHABLE_KEY";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById("formTugas");
const pesan = document.getElementById("pesan");
const tombol = document.getElementById("btnKirim");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  tombol.disabled = true;
  pesan.textContent = "Mengirim tugas...";

  let pathFile = null;

  try {
    const nama = document.getElementById("nama").value.trim();
    const nim = document.getElementById("nim").value.trim();
    const kelas = document.getElementById("kelas").value.trim();
    const matakuliah = document.getElementById("matakuliah").value.trim();
    const tugas = document.getElementById("tugas").value.trim();
    const file = document.getElementById("file").files[0];

    const format = ["pdf", "doc", "docx", "ppt", "pptx", "zip"];
    const ekstensi = file.name.split(".").pop().toLowerCase();

    if (!format.includes(ekstensi)) {
      throw new Error("Format file tidak didukung!");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Ukuran file maksimal 10 MB!");
    }

    pathFile = `pengumpulan/${crypto.randomUUID()}.${ekstensi}`;

    // Upload file ke Supabase Storage
    const { error: uploadError } = await db.storage
      .from("file-tugas")
      .upload(pathFile, file);

    if (uploadError) throw uploadError;

    // Simpan data ke database
    const { error: dataError } = await db
      .from("tugas")
      .insert({
        nama_mahasiswa: nama,
        nim: nim,
        kelas: kelas,
        mata_kuliah: matakuliah,
        nama_tugas: tugas,
        file_url: pathFile
      });

    if (dataError) throw dataError;

    pesan.textContent = "Tugas berhasil dikumpulkan!";
    pesan.style.color = "green";

    form.reset();

  } catch (error) {
    if (pathFile) {
      await db.storage.from("file-tugas").remove([pathFile]);
    }

    pesan.textContent = "Gagal: " + error.message;
    pesan.style.color = "red";

    console.error(error);

  } finally {
    tombol.disabled = false;
  }
});
