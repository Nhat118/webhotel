// Khi người dùng đăng nhập thành công
const userInfo = {
  name: "Nguyễn Văn A",
  phone: "0123456789",
  email: "nguyenvana@example.com"
};
localStorage.setItem("currentUser", JSON.stringify(userInfo));

// Xử lý hiển thị modal đặt phòng
bookButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Bạn cần đăng nhập để đặt phòng.");
      window.location.href = "../accounts/login.html";
      return;
    }

    const room = this.getAttribute('data-room');
    modalRoomName.textContent = room;

    // Tự động điền thông tin khách hàng vào form
    document.getElementById('customer-name').value = currentUser.name || "";
    document.getElementById('customer-phone').value = currentUser.phone || "";
    document.getElementById('customer-email').value = currentUser.email || "";

    bookingModal.style.display = 'block';
  });
});