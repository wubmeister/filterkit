<?php

$data = json_decode(file_get_contents('data.json'), true);
$result = [];
$searchText = isset($_GET['search']) ? strtolower($_GET['search']) : '';
$searchFields = ['firstname', 'lastname', 'email', 'company' ];

if (!$searchText) {
	$result = $data;
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
		}
	}
}

// header('Content-Type: application/json');
// echo json_encode($result);

foreach ($result as $item):
?>
<div class="item">
	<div class="headline"><span class="firstname"><?= $item['firstname'] ?></span> <?= $item['infix'] ?> <span class="lastname"><?= $item['lastname'] ?></span></div>
		<div class="meta">
			<span class="email"><?= $item['email'] ?></span> |
			<span class="company"><?= $item['company'] ?></span>
		</div>
	</div>
</div>
<?php endforeach; ?>
