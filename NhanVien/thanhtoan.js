// Dữ liệu mẫu về phòng cần thanh toán
let pendingRooms = {
  101: {
    roomRate: 1000000,
    checkIn: "2024-02-20",
    checkOut: "2024-02-22",
    services: [
      { name: "Dịch vụ spa", price: 500000 },
      { name: "Ăn sáng", price: 200000 },
    ],
  },
  102: {
    roomRate: 1500000,
    checkIn: "2024-02-21",
    checkOut: "2024-02-25",
    services: [{ name: "Giặt ủi", price: 300000 }],
  },
};

// Lưu trữ lịch sử thanh toán
let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || [];

// Cập nhật danh sách phòng trong dropdown
function updateRoomList() {
  const roomSelect = document.getElementById("roomNumber");
  roomSelect.innerHTML = '<option value="">-- Chọn số phòng --</option>';

  Object.keys(pendingRooms).forEach((roomNum) => {
    roomSelect.innerHTML += (
      <option value="${roomNum}">Phòng ${roomNum}</option>
    );
  });
}

function loadRoomDetails() {
  const roomNumber = document.getElementById("roomNumber").value;
  const roomCharge = document.getElementById("roomCharge");
  const servicesList = document.getElementById("servicesList");
  const totalAmount = document.getElementById("totalAmount");

  if (!roomNumber) {
    resetBillDetails();
    return;
  }

  const room = pendingRooms[roomNumber];

  // Hiển thị tiền phòng
  roomCharge.textContent = formatCurrency(room.roomRate);

  // Hiển thị dịch vụ
  servicesList.innerHTML = "";
  let servicesTotal = 0;
  room.services.forEach((service) => {
    servicesList.innerHTML += `
            <div class="bill-item">
                <span>${service.name}</span>
                <span>${formatCurrency(service.price)}</span>
            </div>
        `;
    servicesTotal += service.price;
  });

  // Tính tổng tiền
  const total = room.roomRate + servicesTotal;
  totalAmount.textContent = formatCurrency(total);
}

function processPayment() {
  const roomNumber = document.getElementById("roomNumber").value;
  if (!roomNumber) {
    alert("Vui lòng chọn phòng cần thanh toán");
    return;
  }

  const room = pendingRooms[roomNumber];
  const total =
    room.roomRate +
    room.services.reduce((sum, service) => sum + service.price, 0);

  // Thêm vào lịch sử thanh toán
  paymentHistory.push({
    roomNumber,
    checkIn: room.checkIn,
    checkOut: room.checkOut,
    roomRate: room.roomRate,
    services: room.services,
    total,
    paymentDate: new Date().toISOString(),
  });

  localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));

  // Xóa phòng khỏi danh sách cần thanh toán
  delete pendingRooms[roomNumber];

  // Cập nhật lại dropdown
  updateRoomList();

  alert("Thanh toán thành công!");
  resetBillDetails();
}

function generateReport() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Vui lòng chọn khoảng thời gian cho báo cáo");
    return;
  }

  // Lọc lịch sử thanh toán theo khoảng thời gian
  const filteredPayments = paymentHistory.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    return (
      paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)
    );
  });

  // Tạo dữ liệu báo cáo từ lịch sử thanh toán
  const reportData = generateReportData(filteredPayments, startDate, endDate);

  // Tạo và tải xuống file Excel
  downloadExcelReport(reportData, startDate, endDate);
}

function generateReportData(payments, startDate, endDate) {
  // Tính tổng doanh thu
  const roomRevenue = payments.reduce((sum, p) => sum + p.roomRate, 0);
  const serviceRevenue = payments.reduce(
    (sum, p) => sum + p.services.reduce((sSum, s) => sSum + s.price, 0),
    0
  );
  const totalRevenue = roomRevenue + serviceRevenue;

  return [
    // Sheet 1: Tổng quan
    {
      name: "Tổng quan",
      data: [
        ["BÁO CÁO DOANH THU KHÁCH SẠN"],
        [`Từ ngày: ${startDate}`, `Đến ngày: ${endDate}`],
        [""],
        ["Loại doanh thu", "Số tiền (VNĐ)"],
        ["Doanh thu phòng", roomRevenue],
        ["Doanh thu dịch vụ", serviceRevenue],
        ["Tổng doanh thu", totalRevenue],
      ],
    },
    // Sheet 2: Chi tiết phòng
    {
      name: "Chi tiết phòng",
      data: [
        ["STT", "Số phòng", "Ngày nhận", "Ngày trả", "Đơn giá", "Thành tiền"],
        ...payments.map((p, index) => [
          index + 1,
          p.roomNumber,
          p.checkIn,
          p.checkOut,
          p.roomRate,
          p.roomRate,
        ]),
      ],
    },
    // Sheet 3: Chi tiết dịch vụ
    {
      name: "Chi tiết dịch vụ",
      data: [
        ["STT", "Số phòng", "Tên dịch vụ", "Đơn giá"],
        ...payments.flatMap((p, index) =>
          p.services.map((s) => [index + 1, p.roomNumber, s.name, s.price])
        ),
      ],
    },
  ];
}

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", () => {
  updateRoomList();

  // Thêm đóng modal lịch sử
  const historyModal = document.getElementById("historyModal");
  document.querySelector(".close-history").onclick = function () {
    historyModal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == historyModal) {
      historyModal.style.display = "none";
    }
  };
});

function downloadExcelReport(reportData, startDate, endDate) {
  // Tạo workbook mới
  const wb = XLSX.utils.book_new();

  // Thêm các sheets vào workbook
  reportData.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);

    // Định dạng các ô
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        // Định dạng tiền tệ cho các cột số tiền
        if (typeof ws[cell_ref].v === "number" && R > 0) {
          ws[cell_ref].z = "#,##0";
        }
      }
    }

    // Điều chỉnh độ rộng cột
    const wscols = sheet.data[0].map(() => ({ wch: 15 }));
    ws["!cols"] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Tạo tên file với timestamp
  const fileName = `bao-cao-doanh-thu-${startDate}-den-${endDate}.xlsx`;

  // Tải xuống file
  XLSX.writeFile(wb, fileName);
}

function resetBillDetails() {
  document.getElementById("roomCharge").textContent = "0 VNĐ";
  document.getElementById("servicesList").innerHTML = "";
  document.getElementById("totalAmount").textContent = "0 VNĐ";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function showPaymentHistory() {
  const modal = document.getElementById("historyModal");
  modal.style.display = "block";
  updatePaymentHistoryTable();

  // Thêm event listeners cho tìm kiếm và sắp xếp
  document
    .getElementById("searchInput")
    .addEventListener("input", updatePaymentHistoryTable);
  document
    .getElementById("sortSelect")
    .addEventListener("change", updatePaymentHistoryTable);
}

function updatePaymentHistoryTable() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortSelect = document.getElementById("sortSelect").value;
  const tableBody = document.getElementById("historyTableBody");

  // Lọc và sắp xếp dữ liệu
  let filteredHistory = paymentHistory.filter((payment) =>
    payment.roomNumber.toLowerCase().includes(searchInput)
  );

  // Sắp xếp dữ liệu
  filteredHistory.sort((a, b) => {
    switch (sortSelect) {
      case "date-desc":
        return new Date(b.paymentDate) - new Date(a.paymentDate);
      case "date-asc":
        return new Date(a.paymentDate) - new Date(b.paymentDate);
      case "amount-desc":
        return b.total - a.total;
      case "amount-asc":
        return a.total - b.total;
      default:
        return 0;
    }
  });

  // Cập nhật bảng
  tableBody.innerHTML = filteredHistory
    .map((payment) => {
      const serviceTotal = payment.services.reduce(
        (sum, service) => sum + service.price,
        0
      );
      return `
            <tr>
                <td>${formatDateTime(payment.paymentDate)}</td>
                <td>Phòng ${payment.roomNumber}</td>
                <td>${formatCurrency(payment.roomRate)}</td>
                <td>${formatCurrency(serviceTotal)}</td>
                <td>${formatCurrency(payment.total)}</td>
                <td>
                    <button class="detail-btn" onclick="showPaymentDetail('${
                      payment.roomNumber
                    }', '${payment.paymentDate}')">
                        <i class="fas fa-info-circle"></i> Chi tiết
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function showPaymentDetail(roomNumber, paymentDate) {
  const payment = paymentHistory.find(
    (p) => p.roomNumber === roomNumber && p.paymentDate === paymentDate
  );

  if (!payment) return;

  // Cập nhật thông tin vào modal
  document.getElementById(
    "detailRoomNumber"
  ).textContent = `Phòng ${payment.roomNumber}`;
  document.getElementById("detailPaymentDate").textContent = formatDateTime(
    payment.paymentDate
  );
  document.getElementById("detailCheckIn").textContent = payment.checkIn;
  document.getElementById("detailCheckOut").textContent = payment.checkOut;
  document.getElementById("detailRoomCharge").textContent = formatCurrency(
    payment.roomRate
  );

  // Hiển thị danh sách dịch vụ
  const servicesList = document.getElementById("detailServicesList");
  servicesList.innerHTML = payment.services
    .map(
      (service) => `
        <div class="detail-service-item">
            <span>${service.name}</span>
            <span>${formatCurrency(service.price)}</span>
        </div>
    `
    )
    .join("");

  // Hiển thị tổng cộng
  document.getElementById("detailTotal").textContent = formatCurrency(
    payment.total
  );

  // Hiển thị modal
  document.getElementById("detailModal").style.display = "block";
}

// Thêm event listener để đóng modal
document.addEventListener("DOMContentLoaded", function () {
  // ... existing code ...

  // Đóng modal chi tiết
  document.querySelector(".close-detail").onclick = function () {
    document.getElementById("detailModal").style.display = "none";
  };

  // Đóng modal khi click bên ngoài
  window.onclick = function (event) {
    const detailModal = document.getElementById("detailModal");
    if (event.target == detailModal) {
      detailModal.style.display = "none";
    }
  };
});

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN");
}
