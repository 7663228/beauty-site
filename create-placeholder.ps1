Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(300, 400)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(240, 240, 240))
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 160, 160))
$g.DrawString("No Image", (New-Object System.Drawing.Font("Arial", 16)), $brush, 90, 185)
$bmp.Save("$PSScriptRoot\public\placeholder.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose()
$bmp.Dispose()
Write-Host "done"
