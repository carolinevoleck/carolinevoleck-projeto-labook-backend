-- Active: 1675434808500@@127.0.0.1@3306
CREATE TABLE users (  
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

CREATE TABLE posts (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes  INTEGER DEFAULT(0) NOT NULL,
    dislikes INTEGER DEFAULT(0) NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    updated_at TEXT DEFAULT (DATETIME()) NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

CREATE TABLE likes_dislikes(
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    like INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM likes_dislikes;

DROP TABLE users;
DROP TABLE posts;
DROP TABLE likes_dislikes;

INSERT INTO users (id, name, email, password, role)
VALUES ("u001", "Virgínia Fonseca", "vivi22@email.com", "f12345#", "NORMAL"),
       ("u002", "Mirella Santos", "milla_ss@email.com", "mi54321*", "ADMIN"),
       ("u003", "Daniel Lima", "dani_lima@email.com", "lima12654%", "NORMAL"),
       ("u004", "Sarah Oliveira", "sarinhah@email.com", "sarahholiver12", "ADMIN"),
       ("u005", "Mônica Silva", "moni_silva@email.com", "monica123@", "NORMAL"),
       ("u006", "Felipe Rodrigues", "felipe@email.com", "felipe5#", "NORMAL");

INSERT INTO posts (id, creator_id, content)
VALUES ("p001", "u001", "Resiliência é ter força dentro de si para sempre recomeçar."),
       ("p002", "u002", "Seja de verdade em tudo que você faz."),
       ("p003", "u003", "Hoje comecei o meu terceiro período na faculdade de Computação"),
       ("p004", "u003", "Começando os estudos de JavaScript! :D");     

   
INSERT INTO likes_dislikes (user_id, post_id, like)
VALUES ("u001", "p001", 0),
       ("u002", "p002", 0),
       ("u003", "p003", 0);

SELECT 
    posts.id,
    posts.creator_id,
    posts.content,
    posts.likes,
    posts.dislikes,
    posts.created_at,
    posts.updated_at,
    users.name 
FROM posts
JOIN users
ON posts.creator_id = users.id;