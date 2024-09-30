// services/WalletManager.js
import { getJettonWallet } from './api/utility'; // API utility fonksiyonunu import edin
import { TON_API_BASE_URL } from './config'; // Gerekli API ayarlarını import edin

class WalletManager {
  constructor(wallet) {
    this.wallet = wallet;
    this.NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi
  }

  async getAccount() {
    const accountInfoResponse = await fetch(`${TON_API_BASE_URL}/account?address=${this.wallet.account.address}`, {
      method: 'GET',
      headers: { "X-API-Key": "d83e9f6d40be3bce2a149a3cf6ef2ac0d2378060cd06adfa5e728bf4cf6de725" }, // Buraya API anahtarınızı ekleyin
    });
    return await accountInfoResponse.json();
  }

  async getTONBalance() {
    const accountInfo = await this.getAccount();
    return accountInfo.balance;
  }

  async getNotcoinWallet() {
    return await getJettonWallet(this.wallet.account.address, this.NOTCOIN_JETTON_CONTRACT);
  }

  async getNotcoinBalance() {
    const wallet = await this.getNotcoinWallet();
    return wallet == null ? 0 : wallet.balance;
  }
}

export default WalletManager;
