// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interface/uniswap.sol";

contract Token is ERC20, Ownable, ERC20Permit, ERC20Votes, ReentrancyGuard {
    /// @notice Router instance
    IUniswapV2Router public uniswapV2Router;

    /// @dev Decimal points used for calculation.
    uint256 public constant DECIMAL_POINTS = 10000;

    /// @dev Max fees percentage that can be configured, 5 %.
    uint256 constant MAX_TAX_PERCENTAGE = 500;

    /// @notice Tax fees percentage.
    uint256 public taxPercentage;

    /// @notice Liquidity add time to prevent the bots.
    uint256 public liquidityAddTime;

    /// @notice Slippage for converting fees to weth.
    uint256 public slippage = 200;

    /// @notice Slippage for converting fees to weth.
    uint256 private _feesOnContract;

    /// @notice Tax receiver address.
    address public taxReceiver;

    /// @notice Whitelisted address
    mapping(address => bool) public whitelistedAddress;

    event ReceiverUpdated(address indexed receiver);
    event TaxFeesUpdated(uint256 indexed taxFees);
    event UpdateWhitelistedAddress(
        address indexed userAddress,
        bool indexed whiteListStatus
    );
    event SlippageUpdated(uint256 indexed slippage);
    event SetLiquidityTime(uint256 indexed timestamp);
    event ClaimExtraETHFunds(uint256 _amount,address payable _to );

    fallback() external payable {}

    // Receive is a variant of fallback that is triggered when msg.data is empty
    receive() external payable {}

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _taxPercentage,
        address _taxReceiver,
        address _router
    ) ERC20(_name, _symbol) Ownable() ReentrancyGuard () ERC20Permit(_name) {
        require(_taxReceiver != address(0), "Cannot set zero address");
        require(_router != address(0), "Cannot set zero address");
        _mint(msg.sender, _totalSupply * 10 ** decimals());
        taxReceiver = _taxReceiver;
        taxPercentage = _taxPercentage;
        uniswapV2Router = IUniswapV2Router(_router);
        emit TaxFeesUpdated(_taxPercentage);
        emit ReceiverUpdated(_taxReceiver);
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal virtual override {
        uint256 _taxAmount;
        if (
            !whitelistedAddress[_from] &&
            !whitelistedAddress[_to] &&
            _from != address(this) &&
            _to != address(this)
        ) {
            require(liquidityAddTime != 0, "Liquidity not provided");
            uint256 _taxPercentage = getTaxPercentage(_to);
            _taxAmount = (_amount * _taxPercentage) / DECIMAL_POINTS;
            _swap(_from, _taxAmount, _getPath(address(this), _getWETH()));
            _feesOnContract = 0;
        } else {
            setInitialLiquidity(_to);
        }
        super._transfer(_from, _to, _amount - _taxAmount);
    }

    /**
     * @notice Get the current tax percentage
     */
    function getTaxPercentage(address _to) public view returns (uint256) {
        if (_to == pairAddress()) {
            uint256 timeDifference = block.timestamp - liquidityAddTime;
            if (timeDifference > 1800) {
                return taxPercentage;
            } else if (timeDifference < 2100 && timeDifference > 900) {
                return 1000;
            } else if (timeDifference < 900 && timeDifference > 300) {
                return 1500;
            } else {
                return 2000;
            }
        } else {
            return taxPercentage;
        }
    }

    /**
     * @dev Internal function to check if liquidity is provided or not.
     */
    function setInitialLiquidity(address _to) internal {
        if (liquidityAddTime == 0 && _to == pairAddress()) {
            liquidityAddTime = block.timestamp;
            emit SetLiquidityTime(liquidityAddTime);
        }
    }

    /**
     * @notice Returns the pair address with WETH
     */
    function pairAddress() public view returns (address) {
        return
            IUniswapV2Factory(_getFactory()).getPair(address(this), _getWETH());
    }

    /**
     * @dev Internal function to convert the fees to tax before sending to receiver.
     */
    function _swap(
        address _from,
        uint256 _amountIn,
        address[] memory _path
    ) private nonReentrant {
        if (_amountIn > 0) {
            super._transfer(_from, address(this), _amountIn);

            _feesOnContract = _feesOnContract + _amountIn;
            if (_from != pairAddress()) {
                IERC20(_path[0]).approve(address(uniswapV2Router), _feesOnContract);

                uint256 _amountOutMin = (uniswapV2Router.getAmountsOut(
                    _feesOnContract,
                    _path
                )[_path.length - 1] * (DECIMAL_POINTS - slippage)) /
                    DECIMAL_POINTS;

                uniswapV2Router
                    .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                        _feesOnContract,
                        _amountOutMin,
                        _path,
                        taxReceiver,
                        block.timestamp
                    );
                _feesOnContract = 0;
            }
        }
    }

    /**
     * @dev Internal function to get the factory address.
     */
    function _getFactory() private view returns (address) {
        return uniswapV2Router.factory();
    }

    /**
     * @dev Internal function to get the WETH address.
     */
    function _getWETH() private view returns (address) {
        return uniswapV2Router.WETH();
    }

    /**
     * @dev Internal function to generate the path from address.
     */
    function _getPath(
        address _tokenA,
        address _tokenB
    ) private pure returns (address[] memory) {
        address[] memory _path;

        _path = new address[](2);
        _path[0] = _tokenA;
        _path[1] = _tokenB;

        return _path;
    }

    /**
     * @notice Whitelist user
     * @dev Update the user whitelist status true if you want to whitelist, false if you want to remove.
     */
    function whiteListUser(
        address _userAddress,
        bool _status
    ) external onlyOwner {
        require(_userAddress != address(0), "Cannot set zero address");
        whitelistedAddress[_userAddress] = _status;
        emit UpdateWhitelistedAddress(_userAddress, _status);
    }

    /**
     * @notice Update the tax slippage for conversion
     * @dev Set the slippage for the conversion, initially it will be 2 percent only.
     */
    function updateSlippage(uint256 _slippage) external onlyOwner {
        require(
            _slippage <= MAX_TAX_PERCENTAGE,
            "Cannot set more than allowed"
        );
        require(_slippage > 0, "Slippage must be greater that 0");

        slippage = _slippage;

        emit SlippageUpdated(_slippage);
    }

    /**
     * @notice Update the tax receiver address
     * @dev Set the treasury address here that will receive the fees.
     */
    function updateReceiverAddress(
        address _receiverAddress
    ) external onlyOwner {
        require(_receiverAddress != address(0), "Cannot set zero address");
        taxReceiver = _receiverAddress;
        emit ReceiverUpdated(_receiverAddress);
    }

    /**
     * @notice Update the tax fees percentage
     * @dev Set the new fees percentage, it cannot be more than allowed amount.
     */
    function updateTaxPercentage(uint256 _taxPercentage) external onlyOwner {
        require(
            _taxPercentage <= MAX_TAX_PERCENTAGE,
            "Cannot set more than allowed"
        );
        taxPercentage = _taxPercentage;
        emit TaxFeesUpdated(_taxPercentage);
    }

    /**
     * @notice Claim ETH send to contract
     * @dev Owner can claime the extra eth send to the contract address.
     */
    function claimExtraETHFunds(uint256 _amount,address payable _to ) external onlyOwner {
        require(
            _amount >= 0,
            "Cannot send 0 amount"
        );
        (bool callSuccess, ) = _to.call{value: _amount}("");
        require(callSuccess, "Transfer failed");
        emit ClaimExtraETHFunds(_amount, _to);
    }

    /**
     * @dev Internal function that we need to override.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Internal function that we need to override.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Internal function that we need to override.
     */
    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Votes) {
        super._mint(account, amount);
    }

    /**
     * @dev Internal function that we need to override.
     */
    function _burn(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }

    /**
     * @dev Internal function that we need to override. It used by voting mechanis to check the nonce for signed transaction.
     */
    function nonces(
        address owner
    ) public view override(ERC20Permit) returns (uint256) {
        return super.nonces(owner);
    }
}
