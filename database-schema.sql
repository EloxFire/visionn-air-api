DROP DATABASE IF EXISTS `visionn_air`;

CREATE DATABASE IF NOT EXISTS `visionn_air`;
USE `visionn_air`;

CREATE TABLE IF NOT EXISTS `all_time_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` date NOT NULL,
  `iqa` int(11) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `latitude` float NOT NULL,
  `longitude` float NOT NULL,
  `main_poluent` varchar(255) NOT NULL,
  `pm2_concentration` float,
  `pm10_concentration` float,
  `o3_concentration` float,
  `no2_concentration` float,
  `so2_concentration` float,
  `co_concentration` float,
  `temperature` int(11) NOT NULL,
  `humidity` int(11) NOT NULL,
  `wind_speed` float NOT NULL,
  `wind_direction` int(11) NOT NULL,
  `pressure` int(11) NOT NULL,
  `visibility` int(11),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;