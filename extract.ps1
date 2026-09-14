Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('d:\Files\Employee\employee .docx')
$entry = $zip.GetEntry('word/document.xml')
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$text = $xml -replace '<w:tab/>', "`t"
$text = $text -replace '</w:p>', "`r`n"
$text = $text -replace '<[^>]+>', ''
$text = [System.Net.WebUtility]::HtmlDecode($text)
[System.IO.File]::WriteAllText('d:\Files\Employee\document_extracted.txt', $text, [System.Text.Encoding]::UTF8)
Write-Output "Extracted successfully"
