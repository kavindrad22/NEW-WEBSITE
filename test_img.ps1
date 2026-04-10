Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\USER\.gemini\antigravity\brain\11e5d8df-09db-4b05-8dac-8c33045f416d\media__1775801874460.jpg')
Write-Host "$($img.Width) x $($img.Height)"
$img.Dispose()
