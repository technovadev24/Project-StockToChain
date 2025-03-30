import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <div className="flex justify-between items-center p-5">
        <div>Logo</div>
        <div><ConnectButton showBalance={false} /></div>
    </div>
  )
}

export default Header