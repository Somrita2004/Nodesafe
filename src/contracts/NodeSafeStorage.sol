
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NodeSafeStorage {
    // Mapping from user address to an array of file hashes
    mapping(address => string[]) private userFiles;
    
    // Event emitted when a new file hash is stored
    event FileStored(address indexed user, string ipfsHash);
    
    // Store a file hash
    function storeFile(string memory ipfsHash) public {
        userFiles[msg.sender].push(ipfsHash);
        emit FileStored(msg.sender, ipfsHash);
    }
    
    // Get all file hashes for the caller
    function getUserFiles() public view returns (string[] memory) {
        return userFiles[msg.sender];
    }
    
    // Check if a file hash exists for the caller
    function fileExists(string memory ipfsHash) public view returns (bool) {
        string[] memory files = userFiles[msg.sender];
        for (uint i = 0; i < files.length; i++) {
            if (keccak256(bytes(files[i])) == keccak256(bytes(ipfsHash))) {
                return true;
            }
        }
        return false;
    }
}
