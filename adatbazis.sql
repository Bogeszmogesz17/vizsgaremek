-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 09. 11:04
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `vizsga2`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `brand`
--

CREATE TABLE `brand` (
  `id` int(11) NOT NULL,
  `brand_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `brand`
--

INSERT INTO `brand` (`id`, `brand_name`) VALUES
(1, 'Toyota'),
(2, 'BMW'),
(3, 'Audi'),
(4, 'Ford'),
(5, 'Mercedes-Benz');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `engine_size`
--

CREATE TABLE `engine_size` (
  `id` int(11) NOT NULL,
  `engine_size` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `engine_size`
--

INSERT INTO `engine_size` (`id`, `engine_size`) VALUES
(15, 1),
(16, 1.2),
(17, 1.3),
(18, 1.4),
(19, 1.5),
(20, 1.6),
(21, 1.8),
(22, 2),
(23, 2.2),
(24, 2.5),
(25, 3),
(26, 3.5),
(27, 4),
(28, 4.4);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `fuel_type`
--

CREATE TABLE `fuel_type` (
  `id` int(11) NOT NULL,
  `fuel_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `fuel_type`
--

INSERT INTO `fuel_type` (`id`, `fuel_name`) VALUES
(1, 'Benzin'),
(2, 'Dízel'),
(3, 'Hibrid'),
(4, 'Elektromos');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `method`
--

CREATE TABLE `method` (
  `id` int(11) NOT NULL,
  `method_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `model`
--

CREATE TABLE `model` (
  `id` int(11) NOT NULL,
  `model_name` varchar(255) NOT NULL,
  `brand_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `model`
--

INSERT INTO `model` (`id`, `model_name`, `brand_id`) VALUES
(1, 'Corolla', 1),
(2, 'Yaris', 1),
(3, 'RAV4', 1),
(4, '320d', 2),
(5, 'X5', 2),
(6, 'M3', 2),
(7, 'A4', 3),
(8, 'A6', 3),
(9, 'Q7', 3),
(10, 'Focus', 4),
(11, 'Mondeo', 4),
(12, 'Kuga', 4),
(13, 'C 220', 5),
(14, 'E 300', 5),
(15, 'GLC 250', 5);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) DEFAULT NULL,
  `is_bookable` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `services`
--

INSERT INTO `services` (`id`, `name`, `price`, `is_bookable`) VALUES
(1, 'Gumizás/Centrírozás', 12000, 1),
(2, 'Átvizsgálás', 5000, 1),
(3, 'Motor- és futómű felújítás / karbantartás', 0, 0),
(4, 'Dióhéjas szívósor tisztítás', 0, 0),
(5, 'Kipufogó gyártás / javítás', 0, 0),
(6, 'Olajcsere / szűrők (olajszűrő, levegőszűrő, pollenszűrő, üzemanyagszűrő)', 0, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `settlement`
--

CREATE TABLE `settlement` (
  `id` int(11) NOT NULL,
  `settlement_name` varchar(255) NOT NULL,
  `post_code` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `settlement`
--

INSERT INTO `settlement` (`id`, `settlement_name`, `post_code`) VALUES
(1, 'Balassagyarmat', 2660),
(2, 'Budapest', 1000),
(3, 'Debrecen', 4024),
(4, 'Szeged', 6720),
(5, 'Miskolc', 3525),
(6, 'Győr', 9021),
(7, 'Pécs', 7621),
(8, 'Kecskemét', 6000),
(9, 'Őrhalom', 2671);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `settlement_id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `phone_number`, `settlement_id`, `address`, `reset_token`) VALUES
(3, 'Bódis Boglárka', 'bogibodis6@gmail.com', '$2y$10$S10Cw2X2n6W.viTd61n4DOmoBGicMfuYmfJFdFkAFaMDW8UMQhDHq', '2026-02-17 12:05:41', '+36308529632', 1, 'Teszt utca 2', '4d2462cdd5921448d1493d917ba5025da925c01f9ddff4358eae6d200c158cb3'),
(4, 'Szalai Szabolcs', 'szszalai626@gmail.com', '$2y$10$N7Wl8785UxnG2k8NfyJXouubkVk7wvzSPmj9LQhGsf00jxqUCEyq.', '2026-02-17 12:39:58', '1234', 1, 'teszt utca', '0edc11d08208a49b0e273af5df2dd3e05ff0e2df871f22fcfc7a5ead27c8b981'),
(8, 'Kiss Attila', 'kissati@gmail.com', '$2y$10$c2Fo7W/5342NsDLvB0ymwuCfY9wfeBO0Ugt7QRBiwbwfqUkhtKW..', '2026-03-03 09:49:01', '', 1, 'Fő út 8.', NULL),
(10, 'Vicc Elek', 'vicc@gmail.com', '$2y$10$AqEVlHzKA/8jPuLGLRfsF.W2NgaDyb8z6xP8fy8PgURxKFGuva4jW', '2026-03-09 10:47:57', '+36302587458', 1, 'Nagyerdei utca 2.', NULL),
(11, 'Koplányi Bítia', 'bituss@icloud.com', '$2y$10$3qiZW0z5whG3f6QrSuEtqeSjvAo22FMsZ4D/5JYmu3kF1ieFzdTDW', '2026-03-10 08:56:32', '06308124579', 1, 'Gácsi út 30', NULL),
(12, 'Kis pista', 'chatgptnk1@gmail.com', '$2y$10$txxKSlqGma6ehr9E/DHCjO4pBvBjEv9N0sDxFOYNzMOwYhvJfR7ci', '2026-03-11 09:52:48', '+36201234567', 1, 'Asdfd 1', NULL),
(13, 'Példa Név', 'peldanev@gmail.com', '$2y$10$XTJ8gYsqHvqQ38q9EHJuJOkLw7Ezouptz.oiJQTNVEUCTdQJHFq0q', '2026-03-11 12:10:04', '+36301234567', 1, 'Példa utca 4.', NULL),
(14, 'Keresztúri Hanna', 'kerhanna05@gmail.com', '$2y$10$Knqs81m6QkKxW/a.9KfsD.r7sf6iAiz4ZGX6IzRcVjhiSaWUT45cG', '2026-03-11 13:51:08', '+36308830625', 1, 'Jókai út 20', NULL),
(15, 'Proba Péter', 'nyusziful2929@gmail.com', '$2y$10$uNzf5Rs7J8GKj3SlymVCeuGfc6Q8cK2Hym9MNkvOGeNuwk6vsZ2lu', '2026-03-13 15:53:04', '+36302584157', 1, 'Mindegy út 8.', NULL),
(16, 'Próba Elek', 'vizsgagpt26@gmail.com', '$2y$10$olYrWY6sEsfIV5xEN.VCZO8oPwtUNeHLdxddd70jQIGCwylZRnZ6G', '2026-03-16 08:00:09', '+36205417896', 1, 'Próba utca 4.', NULL),
(17, 'Balla Kristóf', 'ballabk02@gmail.com', '$2y$10$004Xvk7s/A9bwLo6jN7RruQ1hPn/hIjywfNZEPq2jmxjX6ogHsmSu', '2026-03-16 19:30:10', '+36204269789', 9, 'Ságvári út 71', NULL),
(18, 'Faludi Bálint', 'faludi.balint08@gmail.com', '$2y$10$fKrDG/pfBCjzzRW2C8risuCMo.Cvy.rMdiUICqwi5C.KhRv98kyfe', '2026-03-18 09:26:24', '+36201234567', 1, 'asdd', NULL),
(19, 'Gazsó Norbert', 'koplanyibitia01@gmail.com', '$2y$10$dMAIvZvePua6q70KCUBQZeA9R2851Qy32t9s4Cm6TBJAT2t9gMpgy', '2026-03-18 09:48:08', '06308124579', 1, 'Gácsi út 30', NULL),
(20, 'Hornyák Ákos', 'hornyak.akos.1020@gmail.com', '$2y$10$zsb2Xg038cRaJ.Eb25I7q.1s5LOkRxKWDXAUwuVQdkWZLPJTZWO1e', '2026-03-18 13:25:29', '06300107041', 1, 'asd', NULL),
(21, 'Bódis Jenő', 'bodisjeno63@gmail.com', '$2y$10$Oc8Lo4qcxuxpkzQH3LW4eexXU9uUd//YgSyXqM19T13VXQ3si7QiK', '2026-03-18 16:02:58', '+36302055698', 1, 'Móricz Zsigmond út 5/1. I/1.', NULL),
(22, 'Keresztúri Hanna', 'hancsika.szgya@gmail.com', '$2y$10$OZyLLAlDf5/Ha4QccVaF3.9dXdOPZkWtNPVRjL2bp2/ekaqkP1t2S', '2026-03-23 10:49:33', '+36308830625', 1, 'Jókai út 20', NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `model_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `fuel_type_id` int(11) NOT NULL,
  `engine_size_id` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `vehicles`
--

INSERT INTO `vehicles` (`id`, `user_id`, `model_id`, `year`, `fuel_type_id`, `engine_size_id`, `active`) VALUES
(32, 10, 7, 2012, 1, 23, 1),
(39, 10, 8, 2011, 2, 23, 1),
(42, 11, 7, 2026, 2, 28, 1),
(43, 4, 13, 2010, 3, 26, 1),
(46, 4, 4, 2010, 1, 23, 1),
(47, 4, 12, 2014, 2, 24, 1),
(56, 12, 8, 2011, 1, 26, 1),
(57, 11, 4, 2010, 1, 26, 1),
(58, 4, 8, 2009, 1, 27, 1),
(59, 4, 6, 2009, 1, 27, 1),
(60, 4, 8, 2010, 3, 26, 1),
(61, 14, 2, 2009, 3, 23, 1),
(62, 4, 6, 2011, 1, 24, 1),
(63, 14, 2, 2022, 3, 24, 1),
(64, 4, 12, 2010, 1, 24, 1),
(65, 4, 6, 2012, 2, 24, 1),
(66, 15, 6, 2011, 3, 27, 1),
(67, 15, 5, 2010, 3, 25, 1),
(68, 15, 6, 2010, 3, 23, 1),
(69, 15, 7, 2010, 1, 20, 1),
(70, 16, 1, 2012, 1, 22, 1),
(71, 16, 8, 2011, 3, 24, 1),
(72, 15, 12, 2014, 1, 24, 1),
(73, 15, 11, 2012, 3, 23, 1),
(74, 15, 4, 2010, 1, 25, 1),
(75, 15, 13, 2011, 2, 23, 1),
(76, 17, 10, 2011, 2, 20, 1),
(77, 18, 9, 2026, 2, 25, 1),
(78, 19, 7, 2012, 2, 26, 1),
(79, 20, 6, 2010, 4, 28, 1),
(80, 20, 9, 2020, 1, 28, 1),
(81, 20, 8, 2012, 1, 27, 1),
(82, 20, 3, 2010, 3, 28, 1),
(83, 21, 10, 2020, 1, 20, 1),
(89, 15, 10, 2019, 1, 22, 1),
(90, 4, 7, 2010, 1, 24, 1),
(91, 4, 8, 2013, 2, 25, 1),
(92, 4, 10, 2010, 1, 22, 1),
(93, 22, 2, 2005, 2, 19, 1),
(94, 22, 7, 2014, 3, 23, 1),
(95, 15, 3, 2014, 1, 24, 1),
(96, 15, 10, 2010, 1, 23, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `work_process`
--

CREATE TABLE `work_process` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` tinyint(4) DEFAULT 0,
  `issued_at` datetime DEFAULT NULL,
  `work_price` int(11) NOT NULL,
  `method_id` int(11) DEFAULT NULL,
  `invoices_id` int(11) DEFAULT NULL,
  `exhibition_date` date DEFAULT NULL,
  `additional_work_description` varchar(255) DEFAULT NULL,
  `payment_deadline` date DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `work_process`
--

INSERT INTO `work_process` (`id`, `vehicle_id`, `appointment_date`, `appointment_time`, `status`, `issued_at`, `work_price`, `method_id`, `invoices_id`, `exhibition_date`, `additional_work_description`, `payment_deadline`, `serial_number`, `completion_date`, `service_id`) VALUES
(1, 32, '2026-08-07', '12:30:00', 1, '2026-03-09 11:29:55', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 39, '2027-05-05', '08:30:00', 1, '2026-03-09 12:01:26', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 43, '2026-07-10', '12:30:00', 1, '2026-03-10 10:08:13', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 56, '2026-07-09', '12:30:00', 1, '2026-03-11 10:24:52', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 60, '2026-07-10', '10:30:00', 1, '2026-03-11 10:53:24', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 61, '2026-05-07', '12:30:00', 1, '2026-03-11 14:01:59', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 62, '2026-07-10', '10:00:00', 1, '2026-03-12 10:09:54', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 39, '2026-05-21', '10:30:00', 1, '2026-03-12 10:56:10', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(26, 39, '2026-05-21', '11:20:00', 1, '2026-03-12 11:00:47', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(27, 63, '2026-04-02', '08:30:00', 1, '2026-03-12 11:23:45', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 63, '2026-05-21', '10:30:00', 1, '2026-03-12 11:24:28', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(30, 65, '2026-06-05', '12:30:00', 1, '2026-03-12 11:33:41', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 65, '2026-05-21', '10:25:00', 1, '2026-03-12 11:34:22', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(32, 66, '2026-06-04', '13:00:00', 1, '2026-03-13 15:53:38', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 66, '2026-04-05', '10:20:00', 1, '2026-03-13 15:55:57', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(34, 67, '2026-07-06', '11:30:00', 1, '2026-03-13 17:44:26', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 69, '2026-06-04', '12:30:00', 1, '2026-03-13 17:45:03', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 67, '2026-08-01', '08:00:00', 0, '2026-03-13 17:47:52', 80000, NULL, 1, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(39, 71, '2026-09-03', '12:30:00', 1, '2026-03-16 08:03:36', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 71, '2026-09-10', '09:00:00', 0, '2026-03-16 08:14:08', 0, NULL, NULL, NULL, 'fékcsere', NULL, NULL, NULL, NULL),
(41, 72, '2026-04-10', '12:30:00', 1, '2026-03-16 10:36:28', 5000, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 73, '2026-09-03', '09:30:00', 0, '2026-03-16 10:36:45', 12000, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 72, '2026-03-18', '09:00:00', 0, '2026-03-16 11:09:37', 223000, NULL, 4, NULL, 'lengéscsillapító csere', NULL, NULL, NULL, NULL),
(44, 74, '2026-03-25', '13:00:00', 1, '2026-03-16 11:37:55', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 75, '2026-06-05', '13:00:00', 0, '2026-03-16 11:46:05', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 76, '2026-03-18', '12:30:00', 1, '2026-03-16 19:31:31', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 76, '2026-03-20', '08:00:00', 1, '2026-03-16 19:39:44', 0, NULL, NULL, NULL, 'vezérlés csere, főtengely szimmering, vízpumpa', NULL, NULL, NULL, NULL),
(48, 77, '2026-04-01', '08:00:00', 1, '2026-03-18 09:27:28', 12000, NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 79, '2027-05-05', '15:30:00', 0, '2026-03-18 13:26:29', 1011999, NULL, 6, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 82, '2026-06-05', '12:30:00', 0, '2026-03-18 13:28:38', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 74, '2026-10-20', '12:00:00', 0, '2026-03-18 13:30:00', 3575, NULL, 7, NULL, 'asd', NULL, NULL, NULL, NULL),
(55, 83, '2026-04-15', '08:30:00', 0, '2026-03-18 16:06:08', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 89, '2026-07-09', '09:00:00', 1, '2026-03-19 12:17:34', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
(57, 89, '2026-05-01', '08:00:00', 1, '2026-03-19 12:38:06', 75000, NULL, 57, '2026-03-19', 'Motor- és futómű felújítás / karbantartás', NULL, NULL, NULL, 3),
(58, 90, '2026-07-03', '15:30:00', 1, '2026-03-23 08:05:51', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
(59, 91, '2026-06-03', '09:00:00', 0, '2026-03-23 08:06:08', 12000, NULL, 59, '2026-03-23', 'Gumizás/Centrírozás', NULL, NULL, NULL, 1),
(60, 90, '2026-07-06', '14:00:00', 0, '2026-03-23 08:06:57', 62000, NULL, 60, '2026-03-23', NULL, NULL, NULL, NULL, 5),
(61, 92, '2026-08-05', '12:30:00', 1, '2026-03-23 08:20:59', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
(62, 92, '2026-08-09', '12:00:00', 0, '2026-03-23 08:21:42', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4),
(63, 93, '2026-03-24', '15:30:00', 1, '2026-03-23 10:51:54', 5000, NULL, 63, '2026-03-23', 'Átvizsgálás', NULL, NULL, NULL, 2),
(65, 93, '2026-03-29', '12:00:00', 0, '2026-03-23 11:02:52', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5),
(66, 95, '2026-03-27', '09:30:00', 1, '2026-03-24 09:33:23', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
(67, 95, '2026-04-20', '12:00:00', 1, '2026-03-24 09:41:52', 65000, NULL, 67, '2026-03-24', 'Kipufogó gyártás / javítás; Munkadíj', NULL, NULL, NULL, 5),
(68, 96, '2026-07-07', '09:30:00', 1, '2026-03-30 10:41:19', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
(69, 96, '2026-04-06', '10:00:00', 0, '2026-03-30 10:43:22', 45000, NULL, 69, '2026-03-30', 'Motor- és futómű felújítás / karbantartás; Munkadíj', NULL, NULL, NULL, 3);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- A tábla indexei `engine_size`
--
ALTER TABLE `engine_size`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- A tábla indexei `fuel_type`
--
ALTER TABLE `fuel_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- A tábla indexei `method`
--
ALTER TABLE `method`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `model`
--
ALTER TABLE `model`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- A tábla indexei `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `settlement`
--
ALTER TABLE `settlement`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `settlement_id` (`settlement_id`);

--
-- A tábla indexei `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `model_id` (`model_id`),
  ADD KEY `fuel_type_id` (`fuel_type_id`),
  ADD KEY `engine_size_id` (`engine_size_id`);

--
-- A tábla indexei `work_process`
--
ALTER TABLE `work_process`
  ADD KEY `id` (`id`),
  ADD KEY `method_id` (`method_id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `invoices_id` (`invoices_id`),
  ADD KEY `fk_service_id` (`service_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `brand`
--
ALTER TABLE `brand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `engine_size`
--
ALTER TABLE `engine_size`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT a táblához `fuel_type`
--
ALTER TABLE `fuel_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `method`
--
ALTER TABLE `method`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `model`
--
ALTER TABLE `model`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `settlement`
--
ALTER TABLE `settlement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT a táblához `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT a táblához `work_process`
--
ALTER TABLE `work_process`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `model`
--
ALTER TABLE `model`
  ADD CONSTRAINT `model_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`);

--
-- Megkötések a táblához `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`settlement_id`) REFERENCES `settlement` (`id`);

--
-- Megkötések a táblához `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_10` FOREIGN KEY (`engine_size_id`) REFERENCES `engine_size` (`id`),
  ADD CONSTRAINT `vehicles_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_8` FOREIGN KEY (`model_id`) REFERENCES `model` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `vehicles_ibfk_9` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_type` (`id`);

--
-- Megkötések a táblához `work_process`
--
ALTER TABLE `work_process`
  ADD CONSTRAINT `fk_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  ADD CONSTRAINT `work_process_ibfk_1` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_11` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_12` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_13` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_14` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_2` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_4` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_5` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_6` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_7` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_8` FOREIGN KEY (`method_id`) REFERENCES `method` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `work_process_ibfk_9` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;