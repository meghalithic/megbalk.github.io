images.list = list.files(path = "images/",
                       pattern = "*.*",
                       full.names = TRUE,
                       recursive = TRUE)

images.list <- gsub("images//",
                    "",
                    images.list)
write.csv(images.list,
          "../../../../../Desktop/images.list.csv",
          row.names = FALSE)
