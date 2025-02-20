// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract VRFCoordinatorV2_5Mock {
    error InvalidRequestConfirmations(uint16 have, uint16 min, uint16 max);
    error InvalidCallbackGasLimit(uint32 have, uint32 min, uint32 max);
    error NumWordsTooBig(uint32 have, uint32 max);
    error InvalidRandomWords(uint256 expected, uint256 actual);

    event RandomWordsRequested(
        uint256 indexed requestId,
        address indexed requester,
        VRFV2PlusClient.RandomWordsRequest request
    );

    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256[] words,
        bool success
    );

    uint256 private nonce = 0;
    mapping(uint256 => VRFV2PlusClient.RandomWordsRequest) public s_requests;
    mapping(uint256 => bool) public s_fulfilled;

    uint16 public constant MIN_REQUEST_CONFIRMATIONS = 3;
    uint16 public constant MAX_REQUEST_CONFIRMATIONS = 200;
    uint32 public constant MIN_CALLBACK_GAS_LIMIT = 100000;
    uint32 public constant MAX_CALLBACK_GAS_LIMIT = 5000000;
    uint32 public constant MAX_NUM_WORDS = 10;

    function requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest memory req
    ) external returns (uint256) {
        // Validate request parameters
        if (req.requestConfirmations < MIN_REQUEST_CONFIRMATIONS || req.requestConfirmations > MAX_REQUEST_CONFIRMATIONS) {
            revert InvalidRequestConfirmations(req.requestConfirmations, MIN_REQUEST_CONFIRMATIONS, MAX_REQUEST_CONFIRMATIONS);
        }
        if (req.callbackGasLimit < MIN_CALLBACK_GAS_LIMIT || req.callbackGasLimit > MAX_CALLBACK_GAS_LIMIT) {
            revert InvalidCallbackGasLimit(req.callbackGasLimit, MIN_CALLBACK_GAS_LIMIT, MAX_CALLBACK_GAS_LIMIT);
        }
        if (req.numWords > MAX_NUM_WORDS) {
            revert NumWordsTooBig(req.numWords, MAX_NUM_WORDS);
        }

        nonce++;
        uint256 requestId = uint256(keccak256(abi.encode(nonce, msg.sender, block.timestamp)));
        s_requests[requestId] = req;
        s_fulfilled[requestId] = false;

        emit RandomWordsRequested(requestId, msg.sender, req);
        return requestId;
    }

    function fulfillRandomWordsWithOverride(
        uint256 requestId,
        address consumerContract,
        uint256[] memory words
    ) external {
        VRFV2PlusClient.RandomWordsRequest memory req = s_requests[requestId];
        if (words.length != req.numWords) {
            revert InvalidRandomWords(req.numWords, words.length);
        }
        if (s_fulfilled[requestId]) {
            revert("Request already fulfilled");
        }

        VRFConsumerBaseV2Plus consumer = VRFConsumerBaseV2Plus(consumerContract);
        
        bool success = true;
        try consumer.rawFulfillRandomWords(requestId, words) {
            s_fulfilled[requestId] = true;
        } catch {
            success = false;
        }

        emit RandomWordsFulfilled(requestId, words, success);
    }

    // Helper function to generate deterministic random numbers for testing
    function generateRandomWords(uint256 requestId, uint32 numWords) public pure returns (uint256[] memory) {
        uint256[] memory words = new uint256[](numWords);
        for (uint32 i = 0; i < numWords; i++) {
            // Generate a deterministic but seemingly random value based on requestId and index
            words[i] = uint256(keccak256(abi.encode(requestId, i)));
        }
        return words;
    }

    function getRequest(uint256 requestId) external view returns (
        VRFV2PlusClient.RandomWordsRequest memory request,
        bool isFulfilled
    ) {
        return (s_requests[requestId], s_fulfilled[requestId]);
    }
} 