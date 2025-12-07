// scripts.js - общие функции доступности

// Управление фокусом в модальных окнах
class FocusTrap {
    constructor(element) {
        this.element = element;
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.firstFocusableElement = this.element.querySelectorAll(this.focusableElements)[0];
        this.focusableContent = this.element.querySelectorAll(this.focusableElements);
        this.lastFocusableElement = this.focusableContent[this.focusableContent.length - 1];
        this.previousActiveElement = null;
    }

    trap(event) {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === this.firstFocusableElement) {
                    event.preventDefault();
                    this.lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === this.lastFocusableElement) {
                    event.preventDefault();
                    this.firstFocusableElement.focus();
                }
            }
        }
    }

    activate() {
        this.previousActiveElement = document.activeElement;
        document.addEventListener('keydown', this.trap.bind(this));
        this.firstFocusableElement.focus();
    }

    deactivate() {
        document.removeEventListener('keydown', this.trap.bind(this));
        if (this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    }
}

// Функция для создания доступных уведомлений
function createAccessibleNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.setAttribute('role', type === 'alert' ? 'alert' : 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    if (duration > 0) {
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    return notification;
}

// Валидация форм
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\+7\s?[\(]?\d{3}[\)]?\s?\d{3}[\-]?\d{2}[\-]?\d{2}$/;
    return re.test(phone);
}

// Адаптивная загрузка изображений
function loadResponsiveImage(imgElement) {
    if ('loading' in HTMLImageElement.prototype) {
        imgElement.loading = 'lazy';
    }
    
    if ('srcset' in HTMLImageElement.prototype) {
        const src = imgElement.getAttribute('src');
        const src2x = src.replace('.', '@2x.');
        imgElement.setAttribute('srcset', `${src} 1x, ${src2x} 2x`);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем ленивую загрузку для всех изображений
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
    
    // Добавляем обработчики для всех форм
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', 'true');
        
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Находим первое невалидное поле
                const firstInvalid = this.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    createAccessibleNotification('Пожалуйста, заполните все обязательные поля правильно', 'warning');
                }
            }
        }, false);
    });
    
    // Добавляем aria-label к иконкам без текста
    document.querySelectorAll('[class*="bi-"]').forEach(icon => {
        if (!icon.textContent.trim() && !icon.closest('button') && !icon.closest('a')) {
            const parent = icon.parentElement;
            if (parent && !parent.getAttribute('aria-label')) {
                const iconClass = Array.from(icon.classList).find(c => c.startsWith('bi-'));
                if (iconClass) {
                    const label = iconClass.replace('bi-', '').replace('-', ' ');
                    parent.setAttribute('aria-label', label);
                }
            }
        }
    });
    
    if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
        document.body.classList.add('high-contrast');
    }
    

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FocusTrap,
        createAccessibleNotification,
        validateEmail,
        validatePhone,
        loadResponsiveImage
    };
}