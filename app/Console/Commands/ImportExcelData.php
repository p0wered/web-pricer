<?php

namespace App\Console\Commands;

use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ImportExcelData extends Command
{
    protected $signature = 'import:excel {filename=test.xlsx : Название файла в директории storage}';
    protected $description = 'Импорт данных из Excel файла в базу данных';

    // Размер пакета для массовой вставки
    const BATCH_SIZE = 5000;

    public function handle()
    {
        $filename = $this->argument('filename');
        $path = storage_path($filename);

        if (!file_exists($path)) {
            $this->error("Файл {$path} не найден!");
            return 1;
        }

        $this->info("Начинаем импорт данных из файла: {$path}");

        try {
            // Загружаем файл
            $spreadsheet = IOFactory::load($path);

            // Очищаем таблицы перед импортом
            if ($this->confirm('Очистить существующие данные перед импортом?', true)) {
                MainProduct::truncate();
                SpecialProduct::truncate();
                $this->info('Таблицы очищены');
            }

            // Получаем все листы
            $sheetNames = $spreadsheet->getSheetNames();
            $totalSheets = count($sheetNames);

            $this->info("Найдено {$totalSheets} листов");
            $bar = $this->output->createProgressBar($totalSheets);

            // Отключаем проверку внешних ключей для ускорения импорта
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $mainProductsData = [];
            $specialProductsData = [];
            $mainProductsCount = 0;
            $specialProductsCount = 0;

            foreach ($sheetNames as $index => $sheetName) {
                // Пропускаем листы Request и Suppliers
                if (strtolower($sheetName) === 'request' || strtolower($sheetName) === 'suppliers') {
                    $bar->advance();
                    continue;
                }

                $sheet = $spreadsheet->getSheetByName($sheetName);
                $rows = $sheet->toArray();

                // Пропускаем заголовок
                if (count($rows) > 0) {
                    array_shift($rows);
                }

                // Определяем, куда записывать - в основную или специальную таблицу
                $isSpecial = str_starts_with($sheetName, '>');
                $targetSheet = $isSpecial ? substr($sheetName, 1) : $sheetName;

                // Обрабатываем строки
                foreach ($rows as $row) {
                    // Проверяем, что строка не пуста (проверка по первой колонке)
                    if (empty($row[0])) continue;

                    $product = [
                        'name' => $row[0] ?? '',
                        'code' => $row[1] ?? null,
                        'quantity' => is_numeric($row[2] ?? '') ? (float)$row[2] : null,
                        'price' => is_numeric($row[3] ?? '') ? (float)$row[3] : null,
                        'description' => $row[4] ?? null,
                        'sheet_name' => $targetSheet,
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

                    // Когда накопили достаточно данных - делаем пакетную вставку
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

            // Вставляем оставшиеся данные
            if (!empty($mainProductsData)) {
                MainProduct::insert($mainProductsData);
            }

            if (!empty($specialProductsData)) {
                SpecialProduct::insert($specialProductsData);
            }

            // Включаем проверку внешних ключей
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            $bar->finish();
            $this->newLine(2);

            $this->info("Импорт завершен успешно!");
            $this->info("Импортировано {$mainProductsCount} записей в основную таблицу");
            $this->info("Импортировано {$specialProductsCount} записей в специальную таблицу");

            return 0;
        } catch (\Exception $e) {
            $this->error("Ошибка при импорте данных: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
