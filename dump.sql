CREATE DATABASE  IF NOT EXISTS `online-journal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `online-journal`;
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: online-journal
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `studentId` int DEFAULT NULL,
  `scheduleId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grades_student_id_schedule_id` (`studentId`,`scheduleId`),
  KEY `scheduleId` (`scheduleId`),
  CONSTRAINT `grades_ibfk_37` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_38` FOREIGN KEY (`scheduleId`) REFERENCES `schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',1,1),(3,'11','2026-09-22 23:05:18','2026-09-22 23:05:18',1,2),(4,'12','2026-09-22 23:05:18','2026-09-22 23:05:18',1,14),(5,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',1,49),(6,'10','2026-09-22 23:05:18','2026-09-22 23:05:18',1,56),(7,'3','2026-09-22 23:05:18','2026-09-22 23:05:18',2,1),(8,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',3,1),(9,'8','2026-09-22 23:05:18','2026-09-22 23:05:18',4,8),(10,'12','2026-09-22 23:05:18','2026-09-22 23:05:18',5,20),(11,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',6,25),(12,'9','2026-09-22 23:05:18','2026-09-22 23:05:18',7,32),(13,'2','2026-09-22 23:05:18','2026-09-22 23:05:18',8,37),(14,'11','2026-09-22 23:05:18','2026-09-22 23:05:18',9,44),(15,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',10,55),(16,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',21,3),(17,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',21,10),(18,'3','2026-09-22 23:05:18','2026-09-22 23:05:18',22,15),(19,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',23,16),(20,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',24,21),(21,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',25,28),(22,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',26,33),(23,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',27,40),(24,'3','2026-09-22 23:05:18','2026-09-22 23:05:18',28,45),(25,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',29,52),(26,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',30,57),(27,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',31,58),(28,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',41,5),(29,'10','2026-09-22 23:05:18','2026-09-22 23:05:18',41,6),(30,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',42,11),(31,'12','2026-09-22 23:05:18','2026-09-22 23:05:18',43,12),(32,'3','2026-09-22 23:05:18','2026-09-22 23:05:18',44,17),(33,'8','2026-09-22 23:05:18','2026-09-22 23:05:18',45,18),(34,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',46,23),(35,'11','2026-09-22 23:05:18','2026-09-22 23:05:18',47,24),(36,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',48,29),(37,'9','2026-09-22 23:05:18','2026-09-22 23:05:18',49,30),(38,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',50,35),(39,'12','2026-09-22 23:05:18','2026-09-22 23:05:18',51,42),(40,'5','2026-09-22 23:05:18','2026-09-22 23:05:18',52,47),(41,'10','2026-09-22 23:05:18','2026-09-22 23:05:18',53,54),(42,'4','2026-09-22 23:05:18','2026-09-22 23:05:18',54,59),(43,'12','2026-09-22 23:05:18','2026-09-22 23:05:18',55,60),(44,'5','2026-09-27 21:31:22','2026-09-27 21:31:22',1,25),(45,'4','2026-09-27 21:31:49','2026-09-27 21:31:49',3,31),(47,'4','2026-09-27 21:40:53','2026-09-27 21:40:53',1,37),(49,'','2026-09-27 21:41:36','2026-09-27 21:41:36',2,25),(53,'5','2026-10-01 15:14:54','2026-10-01 15:14:54',1,19),(54,'3','2026-10-04 12:38:09','2026-10-04 12:38:09',3,13),(55,'5','2026-10-04 14:11:56','2026-10-04 14:11:56',3,25),(56,'3','2026-10-04 14:48:08','2026-10-04 14:48:08',1,13),(58,'5','2026-10-04 18:37:52','2026-10-04 18:37:52',3,43),(60,'2','2026-10-08 20:08:45','2026-10-08 20:08:45',5,49),(61,'н','2026-10-12 22:45:26','2026-10-12 22:45:26',1,69),(62,'н','2026-10-13 07:14:22','2026-10-13 07:14:22',1,67),(63,'4','2026-10-21 15:51:08','2026-10-21 15:51:08',1,43),(64,'5','2026-10-21 16:10:09','2026-10-21 16:10:09',2,65),(65,'4','2026-10-22 13:51:19','2026-10-22 13:51:19',1,77),(66,'н','2026-10-22 14:09:46','2026-10-22 14:09:46',1,78),(67,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',6,19),(68,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',8,77),(69,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',1,71),(70,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',5,78),(72,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',4,71),(73,'н','2026-10-22 14:10:13','2026-10-22 14:10:13',10,71),(74,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',3,55),(75,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',1,31),(76,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',1,55),(77,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',5,31),(78,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',9,25),(79,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',17,55),(80,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',14,31),(81,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',12,37),(82,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',10,31),(83,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',17,25),(84,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',19,37),(85,'н','2026-10-22 14:10:29','2026-10-22 14:10:29',20,25),(86,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',22,9),(87,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',21,39),(88,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',24,9),(89,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',29,39),(90,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',27,3),(91,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',30,3),(92,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',31,33),(93,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',35,9),(94,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',32,9),(95,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',37,39),(96,'н','2026-10-22 14:10:52','2026-10-22 14:10:52',39,3),(97,'н','2026-10-22 14:12:13','2026-10-22 14:12:13',41,29),(98,'н','2026-10-22 14:12:13','2026-10-22 14:12:13',55,53),(99,'н','2026-10-22 14:12:13','2026-10-22 14:12:13',51,23),(100,'н','2026-10-22 14:12:13','2026-10-22 14:12:13',50,59),(101,'н/а','2026-10-22 14:17:30','2026-10-22 14:17:30',2,77),(104,'н/а','2026-10-22 14:17:30','2026-10-22 14:17:30',15,77),(105,'2','2026-10-25 13:53:30','2026-10-25 13:53:30',2,71),(106,'5','2026-10-25 14:17:22','2026-10-25 14:17:22',6,69),(107,'н/а','2026-10-25 15:58:47','2026-10-25 15:58:47',3,37),(110,'2','2026-10-29 17:15:34','2026-10-29 17:15:34',1,92);
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `teacherId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacherId` (`teacherId`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'П-13','2026-09-22 23:02:15','2026-09-22 23:02:15',1),(2,'К-39','2026-09-22 23:02:15','2026-09-22 23:02:15',2),(3,'П-43','2026-09-22 23:02:15','2026-09-22 23:02:15',1);
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `lessonNumber` int NOT NULL,
  `topic` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `subjectId` int DEFAULT NULL,
  `room` varchar(255) DEFAULT NULL,
  `lessonType` varchar(255) NOT NULL DEFAULT 'Пара',
  `homework` text,
  `teacherId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `schedules_teacherId_foreign_idx` (`teacherId`),
  KEY `subjectId` (`subjectId`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `schedules_teacherId_foreign_idx` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,'2026-09-29 00:00:00',1,'Вступна лекція','2026-09-22 23:05:02','2026-10-13 12:05:29',1,'413','para','12',NULL),(2,'2026-10-04 00:00:00',2,'Кінематика: основні поняття','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para','Написати конспект',NULL),(3,'2026-10-01 00:00:00',1,'Вступ до програмування. Змінні','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(4,'2026-10-02 00:00:00',2,'Вступ до баз даних','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(5,'2026-09-28 00:00:00',1,'Оцінка складності алгоритмів. О-велике','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(6,'2026-09-29 00:00:00',2,'Основи комп`ютерних мереж','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(8,'2026-10-01 00:00:00',2,'Динаміка. Закони Ньютона','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(9,'2026-10-02 00:00:00',1,'Базові типи даних','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(10,'2026-09-28 00:00:00',2,'Реляційна модель даних','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(11,'2026-09-29 00:00:00',1,'Структури даних: Масиви','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(12,'2026-09-30 00:00:00',2,'Еталонна модель OSI','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(13,'2026-10-01 00:00:00',1,'Системи лінійних рівнянь','2026-09-22 23:05:02','2026-09-22 23:05:02',1,'413','para',NULL,NULL),(14,'2026-10-02 00:00:00',2,'Робота і енергія','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(15,'2026-09-28 00:00:00',1,'Умовні конструкції (if, switch)','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(16,'2026-09-29 00:00:00',2,'Проектування БД. ER-діаграми','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(17,'2026-09-30 00:00:00',1,'Зв`язні списки (одно- та двоспрямовані)','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(18,'2026-10-01 00:00:00',2,'Стек протоколів TCP/IP','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(19,'2026-10-02 00:00:00',1,'Системи лінійних рівнянь','2026-09-22 23:05:02','2026-10-12 18:11:02',1,'413','para','',NULL),(20,'2026-09-28 00:00:00',2,'Молекулярна фізика','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(21,'2026-09-29 00:00:00',1,'Цикли (while, do-while)','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(22,'2026-09-30 00:00:00',2,'Мова SQL: базовий SELECT','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(23,'2026-10-01 00:00:00',1,'Стек і черга','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(24,'2026-10-02 00:00:00',2,'Фізичний рівень мережі. Кабелі','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(25,'2026-09-28 00:00:00',1,'Пряма і площина у просторі','2026-09-22 23:05:02','2026-09-22 23:05:02',1,'413','para',NULL,NULL),(26,'2026-09-29 00:00:00',2,'Основи термодинаміки','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(27,'2026-09-30 00:00:00',1,'Цикли (for)','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(28,'2026-10-01 00:00:00',2,'SQL: INSERT, UPDATE, DELETE','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(29,'2026-10-02 00:00:00',1,'Рекурсія: принципи роботи','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(30,'2026-09-28 00:00:00',2,'Канальний рівень. Технологія Ethernet','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(31,'2026-09-29 00:00:00',1,'Криві другого порядку','2026-09-22 23:05:02','2026-09-22 23:05:02',1,'413','para',NULL,NULL),(32,'2026-09-30 00:00:00',2,'Електростатика. Закон Кулона','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(33,'2026-10-01 00:00:00',1,'Одновимірні масиви','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(34,'2026-10-02 00:00:00',2,'SQL: Об`єднання таблиць (JOIN)','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(35,'2026-09-28 00:00:00',1,'Алгоритми сортування: Бульбашка','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(36,'2026-09-29 00:00:00',2,'MAC-адресація та комутатори','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(37,'2026-09-30 00:00:00',1,'','2026-09-22 23:05:02','2026-10-29 16:37:26',1,'413','para','Вправа 144',NULL),(38,'2026-10-01 00:00:00',2,'Постійний електричний струм','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(39,'2026-10-02 00:00:00',1,'Багатовимірні масиви','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(40,'2026-09-28 00:00:00',2,'SQL: Агрегатні функції та GROUP BY','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(41,'2026-09-29 00:00:00',1,'Алгоритми сортування: Вставка та Вибір','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(42,'2026-09-30 00:00:00',2,'Мережевий рівень. Протокол IPv4','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(43,'2026-10-01 00:00:00',1,'Похідна та її геометричний зміст','2026-09-22 23:05:02','2026-10-21 16:11:49',1,'413','para','Вправа: 12',NULL),(44,'2026-10-02 00:00:00',2,'Магнітне поле','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(45,'2026-09-28 00:00:00',1,'Функції. Передача параметрів','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(46,'2026-09-29 00:00:00',2,'Підзапити в SQL','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(47,'2026-09-30 00:00:00',1,'Швидке сортування (Quicksort)','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(48,'2026-10-01 00:00:00',2,'IP-адресація та маски підмереж','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(49,'2026-10-02 00:00:00',1,'Застосування похідної. Дослідження функцій','2026-09-22 23:05:02','2026-09-22 23:05:02',1,'413','para',NULL,NULL),(50,'2026-09-28 00:00:00',2,'Електромагнітна індукція','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(51,'2026-09-29 00:00:00',1,'Область видимості змінних','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(52,'2026-09-30 00:00:00',2,'Індекси. Оптимізація запитів','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(53,'2026-10-01 00:00:00',1,'Алгоритми пошуку: Лінійний та Бінарний','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(54,'2026-10-02 00:00:00',2,'Основи маршрутизації','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(55,'2026-09-28 00:00:00',1,'Невизначений інтеграл','2026-09-22 23:05:02','2026-09-22 23:05:02',1,'413','para',NULL,NULL),(56,'2026-09-29 00:00:00',2,'Геометрична оптика','2026-09-22 23:05:02','2026-09-22 23:05:02',2,'413','para',NULL,NULL),(57,'2026-09-30 00:00:00',1,'Вказівники (основи)','2026-09-22 23:05:02','2026-09-22 23:05:02',3,'413','para',NULL,NULL),(58,'2026-10-01 00:00:00',2,'Нормалізація баз даних','2026-09-22 23:05:02','2026-09-22 23:05:02',4,'413','para',NULL,NULL),(59,'2026-10-02 00:00:00',1,'Структури даних: Дерева (вступ)','2026-09-22 23:05:02','2026-09-22 23:05:02',5,'413','para',NULL,NULL),(60,'2026-09-28 00:00:00',2,'Транспортний рівень: TCP vs UDP','2026-09-22 23:05:02','2026-09-22 23:05:02',6,'413','para',NULL,NULL),(65,'2026-10-06 00:00:00',2,'','2026-10-06 17:36:13','2026-10-07 19:42:23',1,'413','para','',NULL),(67,'2026-10-09 00:00:00',2,'Системи лінійних рівнянь','2026-10-09 18:23:31','2026-10-09 18:23:31',1,'413','para','',NULL),(68,'2026-10-12 00:00:00',2,'','2026-10-11 21:19:54','2026-10-11 21:19:54',5,'413','para','',NULL),(69,'2026-10-13 00:00:00',3,'','2026-10-12 22:45:16','2026-10-12 22:45:16',1,'413','para','',NULL),(70,'2026-10-13 00:00:00',5,'','2026-10-13 12:14:36','2026-10-13 12:14:36',1,'413','para','',NULL),(71,'2026-10-13 00:00:00',6,'','2026-10-13 12:15:04','2026-10-13 12:15:04',1,'413','para','',NULL),(72,'2026-10-14 00:00:00',6,'Контрольна робота','2026-10-14 12:58:46','2026-10-14 12:58:46',5,'413','para','',NULL),(77,'2026-10-23 00:00:00',3,'','2026-10-21 16:10:37','2026-10-22 14:12:44',1,'','notebook','',NULL),(78,'2026-10-21 00:00:00',2,'','2026-10-21 17:11:07','2026-10-21 17:11:07',1,'413','para','',NULL),(79,'2026-10-23 00:00:00',5,'Системи лінійних рівнянь','2026-10-23 17:44:56','2026-10-23 17:44:56',1,'413','para','Номер: 112',NULL),(82,'2026-10-25 00:00:00',1,'','2026-10-25 14:15:11','2026-10-25 14:15:11',1,'413','para','',NULL),(83,'2026-10-26 00:00:00',3,'','2026-10-25 14:28:09','2026-10-25 14:28:09',1,'413','para','',NULL),(84,'2026-10-26 00:00:00',6,'','2026-10-25 14:28:21','2026-10-25 14:28:21',1,'413','para','',NULL),(85,'2026-10-30 00:00:00',2,'','2026-10-29 16:33:12','2026-10-29 16:33:12',1,'413','para','',NULL),(86,'2026-10-30 00:00:00',3,'Системи лінійних рівнянь','2026-10-29 16:33:35','2026-10-29 16:33:35',1,'413','para','Бла бла бла',NULL),(90,'2026-10-30 00:00:00',3,'','2026-10-29 16:52:45','2026-10-29 16:52:45',1,'413','para','',NULL),(91,'2026-10-30 00:00:00',6,'','2026-10-29 17:15:02','2026-10-29 17:15:02',1,'413','para','',NULL),(92,'2026-10-31 00:00:00',6,'','2026-10-29 17:15:11','2026-10-29 17:15:11',1,NULL,'semester','',NULL);
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `groupId` (`groupId`),
  CONSTRAINT `students_ibfk_37` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_ibfk_38` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'Годлевський Кирил Васильович','2026-09-22 23:02:42','2026-09-22 23:02:42',3,1),(2,'Коваленко Андрій Миколайович','2026-09-22 23:02:42','2026-09-22 23:02:42',4,1),(3,'Петренко Олександр Іванович','2026-09-22 23:02:42','2026-09-22 23:02:42',5,1),(4,'Мельник Вікторія Сергіївна','2026-09-22 23:02:42','2026-09-22 23:02:42',6,1),(5,'Бондар Ірина Олександрівна','2026-09-22 23:02:42','2026-09-22 23:02:42',7,1),(6,'Ткаченко Сергій Володимирович','2026-09-22 23:02:42','2026-09-22 23:02:42',8,1),(7,'Шевчук Марія Юріївна','2026-09-22 23:02:42','2026-09-22 23:02:42',9,1),(8,'Гриценко Дмитро Олексійович','2026-09-22 23:02:42','2026-09-22 23:02:42',10,1),(9,'Бойко Павло Вікторович','2026-09-22 23:02:42','2026-09-22 23:02:42',11,1),(10,'Павленко Юлія Анатоліївна','2026-09-22 23:02:42','2026-09-22 23:02:42',12,1),(11,'Савченко Катерина Андріївна','2026-09-22 23:02:42','2026-09-22 23:02:42',13,1),(12,'Лисак Артем Тарасович','2026-09-22 23:02:42','2026-09-22 23:02:42',14,1),(13,'Романенко Тетяна Олегівна','2026-09-22 23:02:42','2026-09-22 23:02:42',15,1),(14,'Кравченко Наталія Ігорівна','2026-09-22 23:02:42','2026-09-22 23:02:42',16,1),(15,'Сидоренко Олексій Дмитрович','2026-09-22 23:02:42','2026-09-22 23:02:42',17,1),(16,'Поліщук Валерія Романівна','2026-09-22 23:02:42','2026-09-22 23:02:42',18,1),(17,'Костенко Іван Петрович','2026-09-22 23:02:42','2026-09-22 23:02:42',19,1),(18,'Лисий Максим Віталійович','2026-09-22 23:02:42','2026-09-22 23:02:42',20,1),(19,'Рудик Софія Михайлівна','2026-09-22 23:02:42','2026-09-22 23:02:42',21,1),(20,'Жук Анастасія Володимирівна','2026-09-22 23:02:42','2026-09-22 23:02:42',22,1),(21,'Клименко Олег Сергійович','2026-09-22 23:02:42','2026-09-22 23:02:42',23,2),(22,'Швець Владислав Миколайович','2026-09-22 23:02:42','2026-09-22 23:02:42',24,2),(23,'Марченко Ігор Олександрович','2026-09-22 23:02:42','2026-09-22 23:02:42',25,2),(24,'Гаврилюк Дарина Павлівна','2026-09-22 23:02:42','2026-09-22 23:02:42',26,2),(25,'Вовк Микола Степанович','2026-09-22 23:02:42','2026-09-22 23:02:42',27,2),(26,'Козак Світлана Юріївна','2026-09-22 23:02:42','2026-09-22 23:02:42',28,2),(27,'Степаненко Антон Богданович','2026-09-22 23:02:42','2026-09-22 23:02:42',29,2),(28,'Литвин Ольга Вікторівна','2026-09-22 23:02:42','2026-09-22 23:02:42',30,2),(29,'Мороз Петро Олексійович','2026-09-22 23:02:42','2026-09-22 23:02:42',31,2),(30,'Кузьменко Володимир Іванович','2026-09-22 23:02:42','2026-09-22 23:02:42',32,2),(31,'Олексієнко Ілля Тарасович','2026-09-22 23:02:42','2026-09-22 23:02:42',33,2),(32,'Приходько Марина Геннадіївна','2026-09-22 23:02:42','2026-09-22 23:02:42',34,2),(33,'Панасюк Тарас Русланович','2026-09-22 23:02:42','2026-09-22 23:02:42',35,2),(34,'Данилюк Христина Василівна','2026-09-22 23:02:42','2026-09-22 23:02:42',36,2),(35,'Соколов Артур Анатолійович','2026-09-22 23:02:42','2026-09-22 23:02:42',37,2),(36,'Захарченко Олена Сергіївна','2026-09-22 23:02:42','2026-09-22 23:02:42',38,2),(37,'Таран Віктор Григорович','2026-09-22 23:02:42','2026-09-22 23:02:42',39,2),(38,'Горбатюк Інна Олександрівна','2026-09-22 23:02:42','2026-09-22 23:02:42',40,2),(39,'Нестеренко Станіслав Олегович','2026-09-22 23:02:42','2026-09-22 23:02:42',41,2),(40,'Гончар Маргарита Дмитрівна','2026-09-22 23:02:42','2026-09-22 23:02:42',42,2),(41,'Кривенко Анна Валеріївна','2026-09-22 23:02:42','2026-09-22 23:02:42',43,3),(42,'Іщенко Олег Юрійович','2026-09-22 23:02:42','2026-09-22 23:02:42',44,3),(43,'Мазур Віталій Миколайович','2026-09-22 23:02:42','2026-09-22 23:02:42',45,3),(44,'Олійник Ілона Андріївна','2026-09-22 23:02:42','2026-09-22 23:02:42',46,3),(45,'Попов Денис Романович','2026-09-22 23:02:42','2026-09-22 23:02:42',47,3),(46,'Волошин Михайло Володимирович','2026-09-22 23:02:42','2026-09-22 23:02:42',48,3),(47,'Юрченко Соломія Петрівна','2026-09-22 23:02:42','2026-09-22 23:02:42',49,3),(48,'Бабенко Андрій Васильович','2026-09-22 23:02:42','2026-09-22 23:02:42',50,3),(49,'Тимошенко Оксана Тарасівна','2026-09-22 23:02:42','2026-09-22 23:02:42',51,3),(50,'Федоров Вадим Ігорович','2026-09-22 23:02:42','2026-09-22 23:02:42',52,3),(51,'Гордієнко Ірина Анатоліївна','2026-09-22 23:02:42','2026-09-22 23:02:42',53,3),(52,'Колісник Максим Олександрович','2026-09-22 23:02:42','2026-09-22 23:02:42',54,3),(53,'Василенко Тетяна Вікторівна','2026-09-22 23:02:42','2026-09-22 23:02:42',55,3),(54,'Михайленко Костянтин Сергійович','2026-09-22 23:02:42','2026-09-22 23:02:42',56,3),(55,'Макаренко Аліна Дмитрівна','2026-09-22 23:02:42','2026-09-22 23:02:42',57,3),(56,'Тарасенко Олександр Богданович','2026-09-22 23:02:42','2026-09-22 23:02:42',58,3),(57,'Остапенко Валентина Олегівна','2026-09-22 23:02:42','2026-09-22 23:02:42',59,3),(58,'Лупашко Іван Русланович','2026-09-22 23:02:42','2026-09-22 23:02:42',60,3),(59,'Зубенко Марія Миколаївна','2026-09-22 23:02:42','2026-09-22 23:02:42',61,3),(60,'Кириленко Сергій Антонович','2026-09-22 23:02:42','2026-09-22 23:02:42',62,3);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `gradingSystem` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `groupId` int DEFAULT NULL,
  `teacherId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `groupId` (`groupId`),
  KEY `teacherId` (`teacherId`),
  CONSTRAINT `subjects_ibfk_37` FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subjects_ibfk_38` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Вища математика',5,'2026-09-22 23:04:44','2026-09-22 23:04:44',1,1),(2,'Фізика',12,'2026-09-22 23:04:44','2026-09-22 23:04:44',1,2),(3,'Основи програмування',5,'2026-09-22 23:04:44','2026-09-22 23:04:44',2,1),(4,'Бази даних',5,'2026-09-22 23:04:44','2026-09-22 23:04:44',2,2),(5,'Алгоритми та структури даних',5,'2026-09-22 23:04:44','2026-09-22 23:04:44',3,1),(6,'Комп`ютерні мережі',12,'2026-09-22 23:04:44','2026-09-22 23:04:44',3,2);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `isCurator` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Дашкевич Володимр Володимирович','2026-09-22 23:01:34','2026-09-22 23:01:34',1,1),(2,'Шевченко Тарас Григорович','2026-09-22 23:01:34','2026-09-22 23:01:34',2,0);
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `resetTocen` varchar(255) DEFAULT NULL,
  `resetTocenExpiration` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'v.dashkevych@ztfk.edu.ua','$2b$12$Xhtm5esgQ0Z.SoKenXwCTOh9qMof2LIzk9gnfvuu0mEpwlTNGoOS.','TEACHER','2026-09-22 23:00:05','2026-10-28 16:37:53',NULL,NULL),(2,'t.shevchenko@ztfk.edu.ua','$2a$12$eb9lr/vQhvKGuHyCRHxvT./uSfT4hgdjsFmRtI9XS4UMRcJOtaFUe','TEACHER','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(3,'k.hodlevskyi@ztfk.edu.ua','$2b$12$RJEu1aO8r1WIsFQbDMxPvOq70tHhFgpcBNhy1wFkwXyquP157yN/.','STUDENT','2026-09-22 23:00:05','2026-10-28 16:31:47',NULL,NULL),(4,'a.kovalenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(5,'o.petrenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(6,'v.melnyk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(7,'i.bondar@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(8,'s.tkachenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(9,'m.shevchuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(10,'d.hrytsenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(11,'p.boyko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(12,'y.pavlenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(13,'k.savchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(14,'a.lysak@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(15,'t.romanenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(16,'n.kravchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(17,'o.sydorenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(18,'v.polishchuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(19,'i.kostenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(20,'m.lysyi@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(21,'s.rudyk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(22,'a.zhuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(23,'o.klymenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(24,'v.shvets@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(25,'i.marchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(26,'d.havryliuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(27,'m.vovk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(28,'s.kozak@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(29,'a.stepanenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(30,'o.lytvyn@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(31,'p.moroz@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(32,'v.kuzmenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(33,'i.oleksiyenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(34,'m.prykhodko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(35,'t.panasiuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(36,'k.danyluk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(37,'a.sokolov@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(38,'o.zakharchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(39,'v.taran@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(40,'i.horbatiuk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(41,'s.nesterenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(42,'m.honchar@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(43,'a.kryvenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(44,'o.ishchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(45,'v.mazur@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(46,'i.oliynyk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(47,'d.popov@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(48,'m.voloshyn@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(49,'s.yurchenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(50,'a.babenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(51,'o.tymoshenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(52,'v.fedorov@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(53,'i.hordienko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(54,'m.kolesnyk@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(55,'t.vasylenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(56,'k.mykhailenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(57,'a.makarenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(58,'o.tarasenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(59,'v.ostapenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(60,'i.lupashko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(61,'m.zubenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL),(62,'s.kyrylenko@ztfk.edu.ua','$2a$12$WJKXhrHaHrYjh49/f0GPfuLRr/AZbeguW29jkaxdFUJ6w9xKjTY3i','STUDENT','2026-09-22 23:00:05','2026-09-22 23:00:05',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-29 20:43:32
