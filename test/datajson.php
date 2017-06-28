<?php

$data = json_decode(file_get_contents('data.json'), true);
$result = [];
$searchText = isset($_GET['search']) ? strtolower($_GET['search']) : '';
$searchFields = ['firstname', 'lastname', 'email', 'company' ];

if (!$searchText) {
    $result = array_slice($data, 0, 20);
} else {
    foreach ($data as $item) {
        $visible = false;

        foreach ($searchFields as $index) {
            if (strlen($searchText) <= strlen($item[$index])) {
                $visible = $visible || strtolower(substr($item[$index], 0, strlen($searchText))) == $searchText;
            }
        }

        if ($visible) {
            $result[] = $item;

            if (count($result) >= 20) break;
        }
    }
}

header('Content-Type: application/json');
echo json_encode($result);
