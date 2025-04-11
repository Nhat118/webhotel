document.addEventListener("DOMContentLoaded", function () {
  // Xử lý đăng ký tài khoản
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const fullname = document.getElementById("fullname").value.trim();
      const dob = document.getElementById("dob").value;
      const gender = document.getElementById("gender").value;
      const cccd = document.getElementById("cccd").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const nationality = document.getElementById("nationality").value.trim();
      const email = document.getElementById("email").value.trim();

      if (localStorage.getItem(username)) {
        alert("Tài khoản đã tồn tại!");
      } else {
        const user = {
          password,
          fullname,
          dob,
          gender,
          cccd,
          phone,
          nationality,
          email,
        };
        localStorage.setItem(username, JSON.stringify(user));
        alert("Đăng ký thành công!");
        window.location.href = "login.html";
      }
    });
  }
  // đăng ký nhân viên
  const registerNvForm = document.getElementById("register-nv-form");

  if (registerNvForm) {
    registerNvForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("nv-username").value.trim();
      const password = document.getElementById("nv-password").value.trim();
      const fullname = document.getElementById("nv-fullname").value.trim();
      const position = document.getElementById("nv-position").value.trim();
      const phone = document.getElementById("nv-phone").value.trim();
      const email = document.getElementById("nv-email").value.trim();

      //  Dùng danh sách nhân viên riêng biệt
      let nhanViens = JSON.parse(localStorage.getItem("nhanViens")) || [];

      const existed = nhanViens.find((nv) => nv.username === username);
      if (existed) {
        alert("Tên đăng nhập nhân viên đã tồn tại!");
        return;
      }

      const newNhanVien = {
        username,
        password,
        fullname,
        position,
        phone,
        email,
      };

      nhanViens.push(newNhanVien);
      localStorage.setItem("nhanViens", JSON.stringify(nhanViens));

      alert("Đăng ký nhân viên thành công!");
      registerNvForm.reset();
    });
  }

  // Xử lý đăng nhập
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();

      const user = JSON.parse(localStorage.getItem(username));

      if (user && user.password === password) {
        alert("Đăng nhập thành công!");
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "../trangchu/index.html";
      } else {
        alert("Tài khoản hoặc mật khẩu không đúng!");
      }
    });
  }

  // Xử lý tìm kiếm phòng
  const roomSearchForm = document.getElementById("roomSearchForm");
  if (roomSearchForm) {
    roomSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const roomType = document
        .getElementById("roomTypeInput")
        .value.toLowerCase()
        .trim();
      const checkin = document.getElementById("checkinInput").value;
      const checkout = document.getElementById("checkoutInput").value;
      const guests = parseInt(document.getElementById("guestsInput").value);
      const cards = document.querySelectorAll("#roomCardsContainer .card");

      if (new Date(checkin) >= new Date(checkout)) {
        alert("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }

      cards.forEach((card) => {
        const title = card.querySelector("h4").textContent.toLowerCase();
        const maxGuests = parseInt(card.getAttribute("data-maxguests"));
        const matchesType = roomType ? title.includes(roomType) : true;
        const matchesGuests = guests ? guests <= maxGuests : true;
        card.style.display = matchesType && matchesGuests ? "" : "none";
      });
    });
  }

  // Xử lý hiển thị modal đặt phòng
  const bookButtons = document.querySelectorAll(".book-btn");
  const bookingModal = document.getElementById("bookingModal");
  const modalRoomName = document.getElementById("modal-room-name");
  const modalClose = bookingModal?.querySelector(".modal-close");

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const roomCard = this.closest(".card");
      const status = roomCard.getAttribute("data-status");

      if (status === "booked" || status === "occupied") {
        alert("Phòng này hiện không khả dụng.");
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("Bạn cần đăng nhập để đặt phòng.");
        window.location.href = "../accounts/login.html";
        return;
      }

      const room = this.getAttribute("data-room");
      modalRoomName.textContent = room;

      // Tự động điền thông tin khách hàng
      document.getElementById("customer-name").value =
        currentUser.fullname || "";
      document.getElementById("customer-phone").value = currentUser.phone || "";
      document.getElementById("customer-email").value = currentUser.email || "";

      bookingModal.style.display = "block";
    });
  });

  // Đóng modal đặt phòng
  modalClose?.addEventListener("click", function () {
    bookingModal.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === bookingModal) {
      bookingModal.style.display = "none";
    }
  });

  // Xử lý đặt phòng
  const bookingFormModal = document.getElementById("booking-form-modal");
  if (bookingFormModal) {
    bookingFormModal.addEventListener("submit", function (e) {
      e.preventDefault();

      const checkin = document.getElementById("checkin").value;
      const checkout = document.getElementById("checkout").value;
      const guests = document.getElementById("guests").value;
      const customerName = document
        .getElementById("customer-name")
        .value.trim();
      const customerPhone = document
        .getElementById("customer-phone")
        .value.trim();
      const customerEmail = document
        .getElementById("customer-email")
        .value.trim();
      const specialRequest = document
        .getElementById("special-request")
        .value.trim();
      const roomName = modalRoomName.textContent;

      if (
        !checkin ||
        !checkout ||
        !guests ||
        !customerName ||
        !customerPhone ||
        !customerEmail
      ) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      if (new Date(checkin) >= new Date(checkout)) {
        alert("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }

      const bookingInfo = {
        roomName,
        checkin,
        checkout,
        guests,
        customerName,
        customerPhone,
        customerEmail,
        specialRequest,
      };

      let bookingHistory =
        JSON.parse(localStorage.getItem("bookingHistory")) || [];
      bookingHistory.push(bookingInfo);
      localStorage.setItem("bookingHistory", JSON.stringify(bookingHistory));

      const roomCard = Array.from(document.querySelectorAll(".card")).find(
        (card) =>
          card.querySelector("h4").textContent.trim().toLowerCase() ===
          roomName.trim().toLowerCase()
      );
      if (roomCard) {
        roomCard.setAttribute("data-status", "booked");
        roomCard.querySelector(".status-text").textContent = "Đã đặt";
      }

      alert(
        `Đặt phòng ${roomName} thành công!\nNgày nhận: ${checkin}\nNgày trả: ${checkout}\nSố khách: ${guests}`
      );
      bookingModal.style.display = "none";
      e.target.reset();
    });
  }

  // Hiển thị lịch sử đặt phòng
  const bookingHistoryBtn = document.getElementById("bookingHistoryBtn");
  if (bookingHistoryBtn) {
    bookingHistoryBtn.addEventListener("click", function () {
      const history = JSON.parse(localStorage.getItem("bookingHistory")) || [];
      const container = document.getElementById("bookingHistoryContent");
      container.innerHTML = "";

      if (history.length === 0) {
        container.innerHTML = "<p>Bạn chưa có lịch sử đặt phòng nào.</p>";
      } else {
        history.forEach((booking, index) => {
          const bookingDiv = document.createElement("div");
          bookingDiv.style.border = "1px solid #ccc";
          bookingDiv.style.padding = "10px";
          bookingDiv.style.marginBottom = "10px";
          bookingDiv.style.borderRadius = "5px";
          bookingDiv.innerHTML = `
              <p><strong>${index + 1}. Phòng:</strong> ${booking.roomName}</p>
              <p><strong>Ngày nhận:</strong> ${booking.checkin}</p>
              <p><strong>Ngày trả:</strong> ${booking.checkout}</p>
              <p><strong>Số khách:</strong> ${booking.guests}</p>
              <p><strong>Tên:</strong> ${booking.customerName}</p>
              <p><strong>SĐT:</strong> ${booking.customerPhone}</p>
              <p><strong>Email:</strong> ${booking.customerEmail}</p>
              <p><strong>Yêu cầu:</strong> ${booking.specialRequest}</p>
            `;
          container.appendChild(bookingDiv);
        });
      }

      document.getElementById("bookingHistoryModal").style.display = "block";
    });
  }

  // Đóng modal lịch sử đặt phòng
  const bookingHistoryClose = document.getElementById("bookingHistoryClose");
  if (bookingHistoryClose) {
    bookingHistoryClose.addEventListener("click", function () {
      document.getElementById("bookingHistoryModal").style.display = "none";
    });
  }

  window.addEventListener("click", function (e) {
    const modalHistory = document.getElementById("bookingHistoryModal");
    if (e.target === modalHistory) {
      modalHistory.style.display = "none";
    }
  });

  // Cập nhật trạng thái phòng khi tải trang
  const bookingHistory =
    JSON.parse(localStorage.getItem("bookingHistory")) || [];
  const roomCards = document.querySelectorAll(".card");

  roomCards.forEach((card) => {
    const roomName = card.querySelector("h4").textContent.trim().toLowerCase();
    const isBooked = bookingHistory.some(
      (booking) => booking.roomName.trim().toLowerCase() === roomName
    );

    if (isBooked) {
      card.setAttribute("data-status", "booked");
      card.querySelector(".status-text").textContent = "Đã đặt";
    }
  });
});
