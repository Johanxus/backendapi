const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

const port = 3000;

app.use(cors({
  origin: "http://localhost:5173" 
}));

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "basededatos"
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/crear', async (req, res) => {
  const datos = req.query;
  try {
    const [results, fields] = await connection.query(
      "INSERT INTO `blogpostadmin` (`id`, `title`, `post`) VALUES (UUID(), ?, ?);",
      [datos.titulo, datos.post]
    );
    if (results.affectedRows > 0) {
      io.emit('nuevoPost', { id: results.insertId, title: datos.titulo, post: datos.post });
      return res.status(200).send("Se ingresó el post correctamente");
    } else {
      return res.status(401).send("No se ingresó nada");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error en el servidor");
  }
});

app.get('/posts', async (req, res) => {
  try {
    const [results, fields] = await connection.query(
      "SELECT * FROM `blogpostadmin` ORDER BY `blogpostadmin`.`fechadePublicacion` DESC"
    );
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error en el servidor");
  }
});

app.get('/crearcomentario', async (req, res) => {
  const datos = req.query;
  try {
    const [results, fields] = await connection.query(
      "INSERT INTO `comentario` (`id`, `Blogpostid`, `UsuarioNombre`, `Comentario`) VALUES (UUID(), ?, ?, ?);",
      [datos.blogid, datos.nombre, datos.comentario]
    );
    if (results.affectedRows > 0) {
      return res.status(200).send("Se ingresó el comentario correctamente");
    } else {
      return res.status(401).send("No se ingresó nada");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error en el servidor");
  }
});

app.get('/comentarios', async (req, res) => {
  try {
    const datos = req.query;
    const [results, fields] = await connection.query(
      "SELECT * FROM `comentario` WHERE `Blogpostid` = ?",
      [datos.id]
    );
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error en el servidor");
  }
});

app.get('/busqueda', async (req, res) => {
  try {
    const datos = req.query;
    const [results, fields] = await connection.query(
      "SELECT `title` FROM `blogpostadmin` WHERE `title` LIKE ? ORDER BY `fechadePublicacion` DESC",
      [`%${datos.titulo}%`]
    );
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).send("No se encontraron datos");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error en el servidor");
  }
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
