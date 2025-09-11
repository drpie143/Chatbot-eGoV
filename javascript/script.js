document.addEventListener("DOMContentLoaded", () => {
  // Biến để lưu trữ toàn bộ dữ liệu thủ tục
  let allProcedures = [];

  // --- TẢI DỮ LIỆU TỪ FILE JSON ---
  // QUAN TRỌNG: Đảm bảo file 'toan_bo_du_lieu_final.json' nằm chung thư mục
  fetch("./toan_bo_du_lieu_final.json")
    .then((response) => {
      if (!response.ok) {
        // Nếu không tìm thấy file, báo lỗi
        throw new Error(
          "Lỗi mạng hoặc không tìm thấy file toan_bo_du_lieu_final.json"
        );
      }
      return response.json();
    })
    .then((data) => {
      allProcedures = data;
      console.log(
        `Tải thành công ${allProcedures.length} thủ tục từ file JSON.`
      );
    })
    .catch((error) => {
      console.error("Lỗi nghiêm trọng khi tải file dữ liệu:", error);
      // Hiển thị thông báo lỗi cho người dùng
      alert(
        "Không thể tải được cơ sở dữ liệu thủ tục. Vui lòng kiểm tra lại file và đường dẫn. Chức năng tìm kiếm sẽ không hoạt động."
      );
    });

  // --- Lấy các phần tử DOM ---
  const getEl = (id) => document.getElementById(id);

  const startChatBtn = getEl("start-chat-btn");
  const chatbotContainer = getEl("chatbot-container");
  const infoModal = getEl("info-modal");
  const searchForm = getEl("search-form");
  const searchInput = getEl("search-input");
  const resultsContainer = getEl("results-container");
  const resultsTitle = getEl("results-title");
  const resultsList = getEl("results-list");
  const homeLink = getEl("home-link");
  const guideBtn = getEl("guide-btn");
  const contactBtn = getEl("contact-btn");
  const chatForm = getEl("chat-form");
  const chatInput = getEl("chat-input");
  const chatMessagesContainer = getEl("chat-messages");

  let lastTriggerElement = null;

  // --- LOGIC MỞ/ĐÓNG CÁC POPUP (MODAL) ---
  const openModal = (modalElement, triggerElement) => {
    lastTriggerElement = triggerElement;
    const rect = triggerElement.getBoundingClientRect();
    const iconCenterX = rect.left + rect.width / 2;
    const iconCenterY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const fromX = iconCenterX - viewportCenterX;
    const fromY = iconCenterY - viewportCenterY;
    modalElement.style.setProperty("--fromX", `${fromX}px`);
    modalElement.style.setProperty("--fromY", `${fromY}px`);
    modalElement.classList.remove("closing");
    modalElement.classList.add("open");
  };

  const closeModal = (modalElement) => {
    if (lastTriggerElement) {
      const rect = lastTriggerElement.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const iconCenterY = rect.top + rect.height / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      const fromX = iconCenterX - viewportCenterX;
      const fromY = iconCenterY - viewportCenterY;
      modalElement.style.setProperty("--fromX", `${fromX}px`);
      modalElement.style.setProperty("--fromY", `${fromY}px`);
    } else {
      modalElement.style.setProperty("--fromX", "0px");
      modalElement.style.setProperty("--fromY", "0px");
    }
    modalElement.classList.add("closing");
    modalElement.addEventListener(
      "animationend",
      () => {
        modalElement.classList.remove("open", "closing");
      },
      { once: true }
    );
  };

  // Gán sự kiện cho các nút
  guideBtn.addEventListener("click", (e) => {
    getEl("info-modal-title").innerHTML = "Hướng dẫn sử dụng";
    getEl(
      "info-modal-body"
    ).innerHTML = `<ul class="list-disc space-y-4 pl-5"><li><strong>Tìm kiếm:</strong> Sử dụng thanh tìm kiếm ở trang chủ để tìm nhanh các thủ tục hành chính theo từ khóa.</li><li><strong>Trò chuyện:</strong> Nhấn nút "Bắt đầu Trò chuyện" để tương tác với trợ lý ảo eGov-Bot.</li><li><strong>Hỏi đáp:</strong> Đặt các câu hỏi rõ ràng, ngắn gọn để nhận được câu trả lời chính xác nhất về các thủ tục bạn quan tâm.</li></ul>`;
    openModal(infoModal, e.currentTarget);
  });

  contactBtn.addEventListener("click", (e) => {
    getEl("info-modal-title").innerHTML = "Thông tin liên hệ";
    getEl("info-modal-body").innerHTML = `<ul class="list-disc space-y-4 pl-5">
                                                <li>
                                                    <strong>Địa chỉ website chính thức:</strong><br>
                                                    Cổng dịch vụ công Quốc gia: <a href="https://dichvucong.gov.vn" target="_blank" class="text-amber-400 hover:underline">www.dichvucong.gov.vn</a>
                                                </li>
                                                <li>
                                                    <strong>Tổng đài hỗ trợ:</strong><br>
                                                    Số điện thoại hỗ trợ (miễn phí): <a href="tel:18001096" class="text-amber-400 hover:underline">1800 1096</a> — phục vụ người dân và doanh nghiệp trong quy trình đăng ký, tra cứu, phản ánh, v.v.
                                                </li>
                                                <li>
                                                    <strong>Email hỗ trợ:</strong><br>
                                                    <a href="mailto:dichvucong@chinhphu.vn" class="text-amber-400 hover:underline">dichvucong@chinhphu.vn</a> — dùng để gửi câu hỏi, góp ý, hoặc phản ánh các vấn đề liên quan đến dịch vụ công trực tuyến.
                                                </li>
                                            </ul>`;
    openModal(infoModal, e.currentTarget);
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => closeModal(modal));
    modal
      .querySelector(".modal-close, #close-chat-btn")
      ?.addEventListener("click", () => closeModal(modal));
  });

  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.reload();
  });
  startChatBtn.addEventListener("click", (e) =>
    openModal(chatbotContainer, e.currentTarget)
  );

  // --- LOGIC TÌM KIẾM ---
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();
    resultsList.innerHTML = ""; // Xóa kết quả cũ

    if (keyword) {
      const filtered = allProcedures.filter((item) =>
        item.ten_thu_tuc?.toLowerCase().includes(keyword)
      );

      if (filtered.length > 0) {
        resultsTitle.textContent = `Kết quả (${filtered.length}):`;
        filtered.forEach((item) => {
          const li = document.createElement("li");
          li.className =
            "p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer";
          li.textContent = item.ten_thu_tuc;

          // Thêm sự kiện click để hiển thị chi tiết
          li.addEventListener("click", (e_li) => {
            const procedureContent = `
                            <div class="space-y-6 text-white/90">
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Cơ quan thực hiện</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.co_quan_thuc_hien ||
                                      "Chưa có thông tin"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Yêu cầu, điều kiện</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.yeu_cau_dieu_kien ||
                                      "Chưa có thông tin"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Thành phần hồ sơ</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.thanh_phan_ho_so ||
                                      "Chưa có thông tin"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Trình tự thực hiện</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.trinh_tu_thuc_hien ||
                                      "Chưa có thông tin"
                                    }</p>
                                </div>
                                 <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Cách thức thực hiện</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.cach_thuc_thuc_hien ||
                                      "Chưa có thông tin"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Thủ tục liên quan</h4>
                                    <p class="whitespace-pre-wrap text-base">${
                                      item.thu_tuc_lien_quan || "Không có"
                                    }</p>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-amber-400 mb-2 text-lg">Nguồn</h4>
                                    <a href="${
                                      item.nguon || "#"
                                    }" target="_blank" class="text-blue-400 hover:underline break-all">${
              item.nguon || "Không có"
            }</a>
                                </div>
                            </div>`;
            getEl("info-modal-title").innerHTML = item.ten_thu_tuc;
            getEl("info-modal-body").innerHTML = procedureContent;
            openModal(infoModal, e_li.currentTarget);
          });
          resultsList.appendChild(li);
        });
      } else {
        resultsTitle.textContent = "Không tìm thấy kết quả nào.";
      }
      resultsContainer.classList.remove("hidden");
    } else {
      resultsContainer.classList.add("hidden");
    }
  });

  // --- LOGIC CHAT (GIẢ LẬP) ---
  let messages = [{ role: "assistant", content: "Chào bạn, tôi là trợ lý ảo eGov-Bot." }];
  let currentSessionId = "user123";  // session mặc định ban đầu
  
  // Thêm nút New Chat
  const newChatBtn = document.createElement("button");
  newChatBtn.textContent = "🆕 New Chat";
  newChatBtn.className = "px-3 py-1 rounded-lg bg-blue-600 text-white text-sm mt-2 hover:bg-blue-700";
  
  newChatBtn.onclick = async () => {
    try {
      const response = await fetch("https://drpie-egov-chatbot.hf.space/newchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: currentSessionId })
      });
      const result = await response.json();
  
      // chỉ đổi sessionId, giữ nguyên lịch sử hiển thị
      currentSessionId = result.session_id;
  
      // thêm 1 tin nhắn hệ thống vào khung chat cho rõ ràng
      messages.push({ role: "assistant", content: "🔄 Đã bắt đầu phiên chat mới. Hãy đặt câu hỏi mới nhé!" });
      renderMessages();
  
    } catch (err) {
      console.error("Không thể tạo new chat:", err);
    }
  };
  
  chatMessagesContainer.parentElement.appendChild(newChatBtn);
  
  // Khi gửi chat thì nhớ gửi đúng session hiện tại
  const response = await fetch("https://drpie-egov-chatbot.hf.space/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: userText,
      session_id: currentSessionId   // dùng session mới
    }),
  });


  // --- LOGIC CHAT ĐÃ NÂNG CẤP ĐỂ GỌI API ---
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (userText === "") return;

    // Hiển thị tin nhắn người dùng
    messages.push({ role: "user", content: userText });
    renderMessages();
    chatInput.value = "";

    // Hiển thị hiệu ứng "đang gõ..."
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "flex items-end gap-2 max-w-[80%] self-start";
    typingIndicator.innerHTML = `<div class="px-4 py-2 rounded-2xl bg-[#4d4d4d] text-white/90 rounded-bl-none"><div class="flex items-center gap-1"><span class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0s;"></span><span class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0.15s;"></span><span class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0.3s;"></span></div></div>`;
    chatMessagesContainer.appendChild(typingIndicator);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    try {
      const API_ENDPOINT = "https://drpie-egov-chatbot.hf.space/chat";
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          session_id: "user123",
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi kết nối đến máy chủ AI");
      }

      const data = await response.json();

      // Xóa hiệu ứng "đang gõ"
      chatMessagesContainer.removeChild(typingIndicator);

      // Thêm toàn bộ câu trả lời vào mảng messages
      messages.push({ role: "assistant", content: data.answer });

      // Hiển thị lại toàn bộ tin nhắn
      renderMessages();

      // --- PHẦN THAY ĐỔI LOGIC CUỘN ---
      const assistantMessageElement = chatMessagesContainer.lastElementChild;
      if (assistantMessageElement) {
        // Vẫn kích hoạt hiệu ứng cho tin nhắn mới (câu trả lời)
        assistantMessageElement.classList.add("message-enter-active");

        // Tìm đến tin nhắn của người dùng (nằm ngay trước câu trả lời)
        const userMessageElement =
          assistantMessageElement.previousElementSibling;

        // Cuộn đến tin nhắn của người dùng thay vì tin nhắn của bot
        if (userMessageElement) {
          userMessageElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
      // --- KẾT THÚC THAY ĐỔI ---
    } catch (error) {
      console.error("Lỗi:", error);
      if (chatMessagesContainer.contains(typingIndicator)) {
        chatMessagesContainer.removeChild(typingIndicator);
      }
      messages.push({
        role: "assistant",
        content: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
      });
      renderMessages();
    }
  });
});
