import { Html5Qrcode } from "html5-qrcode";

export const useHtml5Code = (domId: string) => {
  const html5QrCode = new Html5Qrcode(domId);

  const start = (qrCodeSuccessCallback: () => void) => {
    const brConfig = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      // aspetRadio: 1.7777778,
    };

    ElMessage.success("掃描");
    html5QrCode
      .start(
        { facingMode: "environment" },
        brConfig,
        qrCodeSuccessCallback,
        qrCodeErrorCallBack
      )
      .catch((err) => {
        console.error("Error starting QR code scanner: ", err);
        // ElMessage.error("Error starting QR code scanner: " + err);
      });
  };

  const handleStop = () => {
    try {
      html5QrCode
        .stop()
        .then(() => {
          html5QrCode.clear();
        })
        .catch((err) => {
          console.error("Error stopping QR code scanner: ", err);
          ElMessage.error("Error stopping QR code scanner: " + err);
        });
    } catch (error) {
      console.error("Error clearing QR code scanner: ", error);
      ElMessage.error("Error clearing QR code scanner: " + error);
    }
  };

  const qrCodeErrorCallBack = (errorMessage: string) => {
    console.error("QR Code Error: ", errorMessage);
    // ElMessage.error("QR Code Error: " + errorMessage);
  };
  return {
    start,
    handleStop,
  };
};
