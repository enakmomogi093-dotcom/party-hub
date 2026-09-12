function createRoom(gameId) {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    alert(`Membuat Room untuk game ${gameId}...\nKode Room kamu: ${roomCode}`);
}
function joinRoom(gameId) {
    const roomCode = prompt("Masukkan 4 digit kode Room dari temanmu:");
    if (roomCode && roomCode.length > 0) {
        alert(`Masuk ke Room ${roomCode} untuk game ${gameId}...`);
    }
}
