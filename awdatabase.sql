-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 07-12-2025 a las 23:23:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `awdatabase`
--

CREATE TABLE `concesionarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `ciudad` varchar(50) NOT NULL,
  `direccion` varchar(50) NOT NULL,
  `telefono` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `mail` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `rol` varchar(10) NOT NULL,
  `telefono` int(11) DEFAULT NULL,
  `id_concesionario` int(11) NOT NULL,
  `accesibilidad` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `matricula` varchar(50) NOT NULL,
  `fecha_ini` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(50) NOT NULL, 
  PRIMARY KEY (`id`),

  CONSTRAINT fk_reservas_usuario
    FOREIGN KEY (`id_usuario`)
    REFERENCES users(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE feedback (
  id int(11) AUTO_INCREMENT PRIMARY KEY,
  id_reserva int(11) NOT NULL UNIQUE,
  comentario VARCHAR(200),
  puntuacion int(11) NOT NULL,
  
  CONSTRAINT fk_reserva_feedback
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_puntuacion
    CHECK (puntuacion BETWEEN 1 AND 5)
);

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `matricula` varchar(20) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `plazas` int(11) NOT NULL,
  `autonomia` int(11) NOT NULL,
  `color` varchar(50) NOT NULL,
  `imagen` varchar(50) NOT NULL,
  `id_concesionario` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`),

  CONSTRAINT fk_vehiculos_concesionario
    FOREIGN KEY (`id_concesionario`)
    REFERENCES concesionarios(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `mail`, `password`, `rol`, `telefono`, `id_concesionario`, `accesibilidad`) VALUES
(1, 'Admin', 'admin@ucm.es', '$2b$10$w5JZSprvOSIi9eZEzakfuurP0F1ikssdVb2DSC5T0UGmjoT92mkj2', 'admin', NULL, 2, NULL);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
