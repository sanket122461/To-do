<?php
require_once '../models/task.php';
require_once '../models/actionlog.php';
require_once '../models/user.php';
session_start();

header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        echo json_encode(Task::all());
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Smart Assign
        if (isset($_GET['smart_assign'])) {
            $users = User::all();
            $minTasks = PHP_INT_MAX;
            $chosen = null;
            foreach ($users as $u) {
                $count = Task::countActiveByUser($u['id']);
                if ($count < $minTasks) {
                    $minTasks = $count;
                    $chosen = $u['id'];
                }
            }
            $taskId = $_GET['id'];
            $task = Task::find($taskId);
            $task['assigned_to'] = $chosen;
            Task::update($taskId, $task);
            ActionLog::log($_SESSION['user_id'], 'smart-assign', $taskId);
            echo json_encode(['success' => true]);
            exit;
        }
        // Validation: unique title, not column name
        $forbidden = ['Todo', 'In Progress', 'Done'];
        if (in_array($data['title'], $forbidden)) {
            echo json_encode(['error' => 'Title cannot match column names']);
            exit;
        }
        if (Task::findByTitle($data['title'])) {
            echo json_encode(['error' => 'Title must be unique']);
            exit;
        }
        Task::create($data);
        ActionLog::log($_SESSION['user_id'], 'create', DB::get()->lastInsertId());
        echo json_encode(['success' => true]);
        break;
    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'];
        $task = Task::find($id);
        if (!$task) {
            echo json_encode(['error' => 'Task not found']);
            exit;
        }
        // Conflict detection
        if (isset($data['updated_at']) && $data['updated_at'] < $task['updated_at']) {
            echo json_encode(['error' => 'Conflict', 'serverTask' => $task]);
            exit;
        }
        Task::update($id, $data);
        ActionLog::log($_SESSION['user_id'], 'update', $id);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = $_GET['id'];
        Task::delete($id);
        ActionLog::log($_SESSION['user_id'], 'delete', $id);
        echo json_encode(['success' => true]);
        break;
}
?>
