import { getJettonWallet } from './path/to/api/utility'; // API utility fonksiyonunu import edin
import { getAccountInfo } from './path/to/api/account'; // Kullanıcı hesap bilgilerini almak için gerekli fonksiyonu import edin

class WalletManager {
  constructor(wallet) {
    this.wallet = wallet;
    this.NOTCOIN_JETTON_CONTRACT = "0:2F956143C461769579BAEF2E32CC2D7BC18283F40D20BB03E432CD603AC33FFC"; // Notcoin jetton contract adresi
    // Diğer jetton kontratlarını buraya ekleyebilirsiniz
  }

  async getAccount() {
    return await getAccountInfo(this.wallet.account.address);
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

  // Diğer jetton wallet fonksiyonlarını buraya ekleyebilirsiniz
}

export default WalletManager;
