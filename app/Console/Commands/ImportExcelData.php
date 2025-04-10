<?php

namespace App\Console\Commands;

use App\Models\ImportSetting;
use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportExcelData extends Command
{
    protected $signature = 'import:excel';
    protected $description = 'Импорт данных из Excel файла в базу данных';
    const BATCH_SIZE = 5000;

    public function handle()
    {
        set_time_limit(0);

        $settings = ImportSetting::first();
        if (!$settings) {
            $this->error('Настройки импорта не найдены в базе данных.');
            return;
        }

        $url = $settings->excel_import_url;
        $username = $settings->excel_import_username;
        $password = $settings->excel_import_password;

        $this->info("Скачивание файла...");

        try {
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            } else {
                $files = glob($tempDir . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
            }

            $tempFile = $tempDir . '/imported_excel_' . time() . '.xlsm';
            $client = new Client();
            $response = $client->get($url, [
                'auth' => [$username, $password],
                'sink' => $tempFile,
            ]);

            if ($response->getStatusCode() != 200) {
                $this->error("Ошибка при скачивании файла: " . $response->getStatusCode());
                return 1;
            }

            $this->info("Временный файл успешно скачан: {$tempFile}");
            $path = $tempFile;
        } catch (\Exception $e) {
            $this->error("Ошибка при скачивании файла: " . $e->getMessage());
            return 1;
        }

        $this->info("Подготовка к импорту данных...");

        try {
            $spreadsheet = IOFactory::load($path);

            MainProduct::truncate();
            SpecialProduct::truncate();
            $this->info('Прошлые данные очищены');

            $sheetNames = $spreadsheet->getSheetNames();
            $totalSheets = count($sheetNames);

            $this->info("Найдено {$totalSheets} листов");
            $bar = $this->output->createProgressBar($totalSheets);

            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $mainProductsData = [];
            $specialProductsData = [];
            $mainProductsCount = 0;
            $specialProductsCount = 0;

            foreach ($sheetNames as $index => $sheetName) {
                if (strtolower($sheetName) === 'request' || strtolower($sheetName) === 'suppliers') {
                    $bar->advance();
                    continue;
                }

                $sheet = $spreadsheet->getSheetByName($sheetName);
                $rows = $sheet->toArray();

                if (count($rows) < 2) {
                    $bar->advance();
                    continue;
                }

                $sheetTitle = trim($rows[0][0] ?? 'Неизвестный лист');
                array_splice($rows, 0, 2);

                $isSpecial = str_starts_with($sheetName, '>');
                $targetSheet = $isSpecial ? substr($sheetName, 1) : $sheetName;

                foreach ($rows as $row) {
                    if (empty($row[0])) continue;

                    $originalName = mb_convert_encoding(substr($row[0] ?? '', 0, 255), 'UTF-8', 'auto');

                    $product = [
                        'name' => $originalName,
                        'code' => $row[1] ?? null,
                        'quantity' => is_numeric($row[2] ?? '') ? (int)$row[2] : null,
                        'price' => $isSpecial ? ($row[3] ?? null) : (is_numeric($row[3] ?? '') ? (float)$row[3] : null),
                        'description' => $row[4] ?? null,
                        'sheet_name' => $isSpecial ? $targetSheet : $sheetTitle,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    if ($isSpecial) {
                        $specialProductsData[] = $product;
                        $specialProductsCount++;
                    } else {
                        $mainProductsData[] = $product;
                        $mainProductsCount++;
                    }

                    if (count($mainProductsData) >= self::BATCH_SIZE) {
                        MainProduct::insert($mainProductsData);
                        $mainProductsData = [];
                    }

                    if (count($specialProductsData) >= self::BATCH_SIZE) {
                        SpecialProduct::insert($specialProductsData);
                        $specialProductsData = [];
                    }
                }

                $bar->advance();
            }

            if (!empty($mainProductsData)) {
                MainProduct::insert($mainProductsData);
            }

            if (!empty($specialProductsData)) {
                SpecialProduct::insert($specialProductsData);
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            $bar->finish();
            $this->newLine(2);

            $this->info("Импорт завершен успешно");
            $this->info("Импортировано {$mainProductsCount} записей в основную таблицу");
            $this->info("Импортировано {$specialProductsCount} записей в стоп таблицу");

            if (file_exists($path)) {
                unlink($path);
                $this->info("Временный файл удален");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("Ошибка при импорте данных: " . $e->getMessage());
            $this->error($e->getTraceAsString());

            if (isset($path) && file_exists($path)) {
                unlink($path);
            }

            return 1;
        }
    }
}
