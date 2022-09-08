export default function toast({title = '', message = '', type = '', duration = 3000}) {
    const main = document.getElementById('toast');
    if(main) {
        const toast = document.createElement('div');
        const fadeOut = 1000;

        // Auto remove toast
        const autoRemoveId = setTimeout(() => {
            main.removeChild(toast);
        }, duration + fadeOut);

        // Remove toast when clicked
        toast.onclick = function (e) {
            if(e.target.closest('.toast__close')) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        }
        const icons = {
            success : 'check_circle',
            warning : 'warning',
            info : 'info',
            error: 'error',
        }
        const icon = icons[type];
      
        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft ease 0.5s, fadeOut linear ${fadeOut}ms ${duration}ms forwards`
        toast.innerHTML = `
            <div class="toast__icon">
                <span class="material-icons-sharp">
                    ${icon}
                </span>
            </div>
            <div class="toast__body">
                <h3 class="toast__title">
                    ${title}
                </h3>
                <p class="toast__msg">${message}</p>
            </div>
            <div class="toast__close">
                <span class="material-icons-sharp">
                    close
                </span>
            </div>
        `;
        main.appendChild(toast);
    }
}

