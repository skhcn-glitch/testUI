// autosave.js
document.addEventListener('DOMContentLoaded', function() {
    restoreAutoSave();
});

document.addEventListener('input', function(e) {
    // 1. Đồng bộ trạng thái vào HTML Attribute để khi save innerHTML sẽ nhớ luôn
    if (e.target.tagName === 'INPUT') {
        if (e.target.type === 'checkbox' || e.target.type === 'radio') {
            if (e.target.checked) e.target.setAttribute('checked', 'checked');
            else e.target.removeAttribute('checked');
        } else {
            e.target.setAttribute('value', e.target.value);
        }
    } else if (e.target.tagName === 'SELECT') {
        let opts = e.target.options;
        for (let i = 0; i < opts.length; i++) {
            if (opts[i].selected) opts[i].setAttribute('selected', 'selected');
            else opts[i].removeAttribute('selected');
        }
    } else if (e.target.tagName === 'TEXTAREA') {
        e.target.textContent = e.target.value;
    }
    
    // 2. Lưu vào LocalStorage
    const pageKey = 'autosave_' + window.location.pathname.split('/').pop();
    const mainBody = document.querySelector('tbody[oninput]');
    if (mainBody) {
        localStorage.setItem(pageKey, mainBody.innerHTML);
    }
});

// Lắng nghe thêm các lệnh DOM (nút bấm Xóa, Thêm dòng) vì chúng không phát ra oninput
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        setTimeout(() => {
            const pageKey = 'autosave_' + window.location.pathname.split('/').pop();
            const mainBody = document.querySelector('tbody[oninput]');
            if (mainBody) {
                localStorage.setItem(pageKey, mainBody.innerHTML);
            }
        }, 100); // Lưu sau khi thao tác xoá dòng hoàn tất
    }
});

function restoreAutoSave() {
    const pageKey = 'autosave_' + window.location.pathname.split('/').pop();
    const savedHTML = localStorage.getItem(pageKey);
    const mainBody = document.querySelector('tbody[oninput]');
    
    if (savedHTML && mainBody) {
        // Có dữ liệu cũ, khôi phục lại
        mainBody.innerHTML = savedHTML;
        
        // Logic fix lại Counter ID cho từng bảng (nếu có script động trong các file)
        if (typeof mainTaskCounter !== 'undefined') {
            let maxMain = 0;
            document.querySelectorAll('.row-main-task').forEach(el => {
                let idNum = parseInt((el.getAttribute('data-main-id') || '').replace('M', '')) || 0;
                if(idNum > maxMain) maxMain = idNum;
            });
            mainTaskCounter = maxMain;
        }
        if (typeof subTaskCounter !== 'undefined') {
            let maxSub = 0;
            document.querySelectorAll('.row-sub-task').forEach(el => {
                let idNum = parseInt((el.getAttribute('data-sub-id') || '').replace('S', '')) || 0;
                if(idNum > maxSub) maxSub = idNum;
            });
            subTaskCounter = maxSub;
        }
        
        // Gọi hàm tính toán lại để số liệu hiển thị chuẩn
        if(typeof calculateLabor === "function") calculateLabor();
        else if(typeof calculateExpertBudget === "function") calculateExpertBudget();
        else if(typeof calculateMaterials === "function") calculateMaterials();
        else if(typeof calculateEquipment === "function") calculateEquipment();
        else if(typeof calculateConstruction === "function") calculateConstruction();
        else if(typeof calculateStep6 === "function") calculateStep6();

        // Tạo nút XÓA CACHE cho màn hình này để bắt đầu lại từ đầu
        if(!document.getElementById('btn-clear-save')) {
            const btnClear = document.createElement('button');
            btnClear.id = 'btn-clear-save';
            btnClear.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Xóa dữ liệu cũ làm lại';
            btnClear.style = 'position: fixed; bottom: 20px; right: 20px; z-index: 100; background: #FFF2F2; color: #ff3b30; border: 1px solid #ffcccc; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(255, 59, 48, 0.15);';
            btnClear.onclick = function() {
                if(confirm('Bạn có chắc muốn xóa sạch bản đã lưu và làm lại trang này?')) {
                    localStorage.removeItem(pageKey);
                    location.reload();
                }
            };
            document.body.appendChild(btnClear);
        }
    }
}
