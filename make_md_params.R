library(readxl)
parameters_dictionary <- read_excel("~/Documents/repos/StormPiper/docs/parameters_dictionary.xlsx",
                                    sheet = "fin")
# Load required libraries
library(knitr)
library(dplyr)



# Assuming 'df' is your dataframe with columns 'Table Name', 'Section', 'Variable', 'Description'
parameters_dictionary
# Function to convert dataframe to markdown text
df_to_md <- function(df){
  output <- c()
  last_table_name <- ""
  last_section <- ""
  
  # Loop through rows of dataframe
  for(i in 1:nrow(df)){
    table_name <- df$ResultName[i]
    section <- df$`Param Category`[i]
    variable <- df$Params[i]
    description <- df$Description[i]
    # If the variables are NA, replace them with an empty string
    if(is.na(table_name)) table_name <- ""
    if(is.na(section)) section <- ""
    if(is.na(variable)) variable <- ""
    if(is.na(description)) description <- ""
    # Only append table name if it's different from the last one
    # if(table_name != last_table_name){
    #   output <- c(output, paste0("\n## ", table_name))
    #   last_table_name <- table_name
    # } else {output <- output}
    
    # Only append section if it's different from the last one
    if(section != last_section){
      output <- c(output, paste0("\n### ", section))
      last_section <- section
    } else {output <- output}
    
    # Append variable and description
    var_info <-paste0(
      "<div id='",variable,"'>",
      variable,
                      
"  ~ ",description,
                      "</div> ",collapse = '<br>')
    
    output <- c(output, var_info)

  }
  
  # Return as single string
  return(paste(output, collapse = "\n"))
}

# Convert dataframe to markdown text
md_text <- df_to_md(parameters_dictionary)

# Write markdown text to .md file
writeLines(md_text, "output.txt")



