const express = require("express")
const app = express();
const port = 3000
const mysql = require("mysql2/promise");
const cors = require("cors");
app.use(cors());
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "basededatos",
  });
  

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/crear', async (req, res) => {
    const datos = req.query;
    try {
        const [results, fields] = await connection.query(
            "INSERT INTO `blogpostadmin` (`id`, `title`, `post`) VALUES (UUID(), ?, ?);",
            [datos.titulo, datos.post]
        );
        if(results.affectedRows > 0){
            return res.status(200).send("Se ingreso el post correctamente")
        }else{
            return res.status(401).send("No se ingreso nada")
        }
        
      } catch (err) {
        console.log(err);
      }

  })
  
  app.get('/posts', async (req, res) => {
    
    try {
        const [results, fields] = await connection.query(
            "SELECT * FROM `blogpostadmin` ORDER BY `fechadePublicacion` DESC"
        )
         res.status(200).json(results)   
            
        
        
        
      } catch (err) {
        console.log(err);
      }

  })
  
  app.get('/crearcomentario', async (req, res) => {
    const datos = req.query;
    try {
        const [results, fields] = await connection.query(
            "INSERT INTO `comentario` (`id`, `Blogpostid`, `UsuarioNombre`, `Comentario`) VALUES (UUID(), ?, ?, ?);",
            [datos.blogid, datos.nombre, datos.comentario]
        );
        if(results.affectedRows > 0){
            return res.status(200).send("Se ingreso el post correctamente")
        }else{
            return res.status(401).send("No se ingreso nada")
        }
        
        
      } catch (err) {
        console.log(err);
      }

  })
  app.get('/comentarios', async (req, res) => {
    
    try {
        const datos = req.query;
        const [results, fields] = await connection.query(
            
            "SELECT * FROM `comentario` WHERE `Blogpostid` = ?",
            [datos.id]
        )
         res.status(200).json(results)   
            
        
        
        
      } catch (err) {
        console.log(err);
      }

  })
  app.get('/busqueda', async (req, res) => {
    
    try {
        const datos = req.query;
        
        const [results, fields] = await connection.query(
            
            "SELECT `title` FROM `blogpostadmin` WHERE `title` LIKE ? ORDER BY `fechadePublicacion` DESC",
            [`%${datos.titulo}%`]
        )
        if(results.length > 0){
          res.status(200).json(results)
        }else{
          res.status(404).send("No se encontraron datos")
        }
        
          
      } catch (err) {
        console.log(err);
      }

  })
  


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})