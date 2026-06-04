let products = JSON.parse(localStorage.getItem("products")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let selectedItems = [];

/* SAVE */
function saveAll() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* NAV */
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(btn.dataset.page).classList.add("active");

        pageTitle.innerText = btn.innerText;
    });
});

/* ADD PRODUCT */
document.getElementById("addProduk").addEventListener("click", () => {
    let nama = document.getElementById("namaProduk").value;
    let harga = parseInt(document.getElementById("hargaProduk").value);

    if (!nama || !harga) return alert("Isi produk lengkap!");

    products.push({ id: Date.now(), nama, harga });

    saveAll();
    renderProduk();
});

/* RENDER PRODUK */
function renderProduk() {
    let list = document.getElementById("listProduk");
    let transaksiList = document.getElementById("produkList");

    list.innerHTML = "";
    transaksiList.innerHTML = "";

    products.forEach(p => {

        list.innerHTML += `
            <div class="list-item">
                <span>${p.nama} - Rp ${p.harga}</span>
                <button onclick="hapusProduk(${p.id})">Hapus</button>
            </div>
        `;

        transaksiList.innerHTML += `
            <div class="produk-item" onclick="selectProduct(${p.id})">
                <b>${p.nama}</b><br>
                Rp ${p.harga}
            </div>
        `;
    });
}

/* DELETE */
function hapusProduk(id) {
    products = products.filter(p => p.id !== id);
    saveAll();
    renderProduk();
}

/* SELECT PRODUCT (NO CART) */
function selectProduct(id) {
    let item = products.find(p => p.id === id);
    if (!item) return;

    selectedItems.push(item);
    alert(`${item.nama} dipilih`);
}

/* CHECKOUT */
document.getElementById("checkoutBtn").addEventListener("click", () => {
    let nama = document.getElementById("namaPelanggan").value;
    let bayar = parseInt(document.getElementById("bayar").value);

    if (selectedItems.length === 0) return alert("Pilih produk dulu!");
    if (!nama) return alert("Isi nama pelanggan!");
    if (!bayar) return alert("Uang bayar belum valid!");

    let total = selectedItems.reduce((a,b) => a + b.harga, 0);
    let kembalian = bayar - total;

    if (kembalian < 0) return alert("Uang kurang!");

    let transaksi = {
        id: Date.now(),
        tanggal: new Date().toISOString().split("T")[0],
        pelanggan: nama,
        items: selectedItems,
        total,
        bayar,
        kembalian
    };

    transactions.push(transaksi);

    selectedItems = [];
    document.getElementById("namaPelanggan").value = "";
    document.getElementById("bayar").value = "";

    saveAll();
    renderDashboard();
    renderRiwayat();
    renderRanking();

    alert(`Transaksi sukses! Kembalian Rp ${kembalian}`);
});

/* DASHBOARD */
function renderDashboard() {
    let totalPenjualan = transactions.reduce((a,b) => a + b.total, 0);

    document.getElementById("totalPenjualan").innerText = totalPenjualan;
    document.getElementById("totalTransaksi").innerText = transactions.length;

    let freq = {};
    transactions.forEach(t => {
        t.items.forEach(i => {
            freq[i.nama] = (freq[i.nama] || 0) + 1;
        });
    });

    let best = Object.keys(freq).sort((a,b)=>freq[b]-freq[a])[0];
    document.getElementById("produkTerlaris").innerText = best || "-";

    let pelanggan = {};
    transactions.forEach(t => {
        pelanggan[t.pelanggan] = (pelanggan[t.pelanggan] || 0) + t.total;
    });

    let top = Object.keys(pelanggan).sort((a,b)=>pelanggan[b]-pelanggan[a])[0];
    document.getElementById("topPelanggan").innerText = top || "-";
}

/* RIWAYAT */
function renderRiwayat() {
    let box = document.getElementById("riwayatList");
    box.innerHTML = "";

    transactions.slice().reverse().forEach(t => {
        box.innerHTML += `
            <div class="item-box">
                <b>${t.pelanggan}</b><br>
                ${t.tanggal}<br>
                Total: Rp ${t.total} | Kembalian: Rp ${t.kembalian}
            </div>
        `;
    });
}

/* RANKING */
function renderRanking() {
    let box = document.getElementById("rankingPelanggan");
    box.innerHTML = "";

    let data = {};

    transactions.forEach(t => {
        data[t.pelanggan] = (data[t.pelanggan] || 0) + t.total;
    });

    Object.entries(data)
        .sort((a,b)=>b[1]-a[1])
        .forEach(([name,total]) => {
            box.innerHTML += `
                <div class="item-box">
                    ${name} - Rp ${total}
                </div>
            `;
        });
}

/* EXPORT CSV */
document.getElementById("exportCSV").addEventListener("click", () => {
    let csv = "Pelanggan,Tanggal,Total,Kembalian\n";

    transactions.forEach(t => {
        csv += `${t.pelanggan},${t.tanggal},${t.total},${t.kembalian}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "laporan.csv";
    a.click();
});

/* CLOSE DAY */
document.getElementById("closeDay").addEventListener("click", () => {
    if (!confirm("Tutup hari?")) return;

    transactions = [];
    saveAll();

    renderDashboard();
    renderRiwayat();
    renderRanking();

    alert("Hari ditutup!");
});

/* INIT */
renderProduk();
renderDashboard();
renderRiwayat();
renderRanking();