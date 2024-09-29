/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
const tonweb = new TonWeb(); // TonWeb'i başlatıyoruz

const request_transaction = async (tonConnectUI) => {
  try {
    console.log('Transaction talep ediliyor...');

    // Cüzdan adresini al
    const walletAddress = tonConnectUI.account?.address;
    if (!walletAddress) {
      console.error("Cüzdan adresi bulunamadı.");
      return; // Cüzdan adresi yoksa fonksiyonu bitir
    }

    console.log('Cüzdan adresi:', walletAddress);

    // Bakiye kontrolü yapmak isterseniz, buraya ekleyebilirsiniz
    // const balanceResponse = await tonweb.provider.getBalance(walletAddress);
    // const tonbalance = balanceResponse.balance;

    // Burada 0.1 TON talep ediyoruz
    const amountToRequest = 100000000; // 0.1 TON'u nanoTON cinsinden belirtin (0.1 * 1e9)

    const targetAddress = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Hedef cüzdan adresi

    // Talep mesajı
    const messages = [
      {
        address: walletAddress, // Cüzdan adresiniz
        amount: amountToRequest, // Talep edilen miktar
        payload: '0.1 TON talep ediyorum', // Talep mesajı
      },
    ];

    console.log('Talep mesajları:', messages);

    // Transaction işlemini başlat
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 saniyelik geçerlilik süresi
      messages,
    };

    console.log('Transaction gönderiliyor...', transaction);

    // Transaction gönder
    const result = await tonConnectUI.sendTransaction(transaction);
    console.log('Transaction başarılı:', result);

  } catch (error) {
    console.error('Transaction hatası:', error);
    alert("Transaction gerçekleşmedi: " + error.message); // Hata mesajını kullanıcıya göster
  }
};

export { request_transaction };
