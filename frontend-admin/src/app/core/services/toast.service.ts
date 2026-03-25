import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  // Simple console-based implementation
  success(message: string): void {
    console.log("✅ Success:", message);
    // You can also use alert for now
    // alert(message);

    // Or create a simple DOM-based toast
    this.showToast(message, "success");
  }

  error(message: string): void {
    console.error("❌ Error:", message);
    this.showToast(message, "error");
  }

  info(message: string): void {
    console.info("ℹ️ Info:", message);
    this.showToast(message, "info");
  }

  warning(message: string): void {
    console.warn("⚠️ Warning:", message);
    this.showToast(message, "warning");
  }

  private showToast(message: string, type: string): void {
    // Simple DOM-based toast notification
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background-color: ${this.getBackgroundColor(type)};
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private getBackgroundColor(type: string): string {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "info":
        return "#2196f3";
      default:
        return "#333";
    }
  }
}
