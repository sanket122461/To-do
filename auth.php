<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../models/user.php';
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($_GET['action'] === 'register') {
        if (User::findByUsername($data['username'])) {
            echo json_encode(['error' => 'Username taken']);
            exit;
        }
        User::create($data['username'], $data['password']);
        echo json_encode(['success' => true]);
    } elseif ($_GET['action'] === 'login') {
        $user = User::findByUsername($data['username']);
        if ($user && password_verify($data['password'], $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['success' => true, 'user_id' => $user['id'], 'username' => $user['username']]);
        } else {
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
}
?>
