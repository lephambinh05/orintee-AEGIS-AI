// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AegisStrategyRegistry
 * @dev Lưu trữ các chiến lược phân tích AI để đảm bảo tính minh bạch trên blockchain Base Sepolia.
 */
contract AegisStrategyRegistry {
    struct Strategy {
        string coinPair;
        uint256 entryPrice;
        uint256 stopLoss;
        uint256 takeProfit;
        uint8 aegisScore;
        bool isLong;
        address creator;
        uint256 timestamp;
    }

    // Danh sách toàn bộ chiến lược
    Strategy[] public strategies;

    // Sự kiện được kích hoạt khi một chiến lược mới được lưu
    event StrategySaved(
        uint256 indexed id, 
        address indexed creator, 
        string coinPair, 
        uint256 timestamp
    );

    /**
     * @dev Lưu một chiến lược mới vào blockchain.
     * @param _coinPair Cặp giao dịch (VD: BTC/USDT)
     * @param _entryPrice Giá vào lệnh (Scaled 10^8)
     * @param _stopLoss Giá cắt lỗ (Scaled 10^8)
     * @param _takeProfit Giá chốt lời (Scaled 10^8)
     * @param _aegisScore Điểm số phân tích AI (0-100)
     * @param _isLong Vị thế Long (true) hay Short (false)
     */
    function savePrediction(
        string memory _coinPair,
        uint256 _entryPrice,
        uint256 _stopLoss,
        uint256 _takeProfit,
        uint8 _aegisScore,
        bool _isLong
    ) public returns (uint256) {
        strategies.push(Strategy({
            coinPair: _coinPair,
            entryPrice: _entryPrice,
            stopLoss: _stopLoss,
            takeProfit: _takeProfit,
            aegisScore: _aegisScore,
            isLong: _isLong,
            creator: msg.sender,
            timestamp: block.timestamp
        }));

        uint256 newId = strategies.length - 1;
        emit StrategySaved(newId, msg.sender, _coinPair, block.timestamp);
        
        return newId;
    }

    /**
     * @dev Lấy tổng số lượng chiến lược đã lưu.
     */
    function getTotalStrategies() public view returns (uint256) {
        return strategies.length;
    }

    /**
     * @dev Lấy thông tin chi tiết của một chiến lược theo ID.
     */
    function getStrategy(uint256 _id) public view returns (Strategy memory) {
        require(_id < strategies.length, "Strategy does not exist");
        return strategies[_id];
    }
}
