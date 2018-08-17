# Description

Utilitaire pour faire un backup permanent d'un dossier dans un bucket S3 de façon éco, en n'envoyant que les fichiers modifiés et sans devoir interroger la liste des fichiers présents dans le bucket.

# Usage

Node doit être installé
`npm install -g kaesapps/backup-s3`
Les crédentials pour S3 doivent être dans le dossier ~/.aws ou en variables d'environnement comme expliqué dans la doc du sdk aws
Se placer dans le répertoire à sauvegarder et lancer la commande
`backup-s3 --bucket=bucketName --delayEnMin=5`
