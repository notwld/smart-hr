--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ChatRoomType; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."ChatRoomType" AS ENUM (
    'DIRECT',
    'TEAM'
);


ALTER TYPE public."ChatRoomType" OWNER TO salad;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."DocumentType" AS ENUM (
    'CNIC',
    'PASSPORT',
    'DEGREE',
    'CERTIFICATE',
    'CONTRACT',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO salad;

--
-- Name: DurationType; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."DurationType" AS ENUM (
    'MONTHLY',
    'YEARLY',
    'CUSTOM'
);


ALTER TYPE public."DurationType" OWNER TO salad;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO salad;

--
-- Name: LeaveStatus; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."LeaveStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."LeaveStatus" OWNER TO salad;

--
-- Name: LeaveType; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."LeaveType" AS ENUM (
    'SICK',
    'VACATION',
    'PERSONAL',
    'MATERNITY',
    'PATERNITY',
    'UNPAID'
);


ALTER TYPE public."LeaveType" OWNER TO salad;

--
-- Name: LegacyRole; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."LegacyRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'EMPLOYEE'
);


ALTER TYPE public."LegacyRole" OWNER TO salad;

--
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MaritalStatus" OWNER TO salad;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'FILE',
    'IMAGE',
    'AUDIO',
    'VIDEO'
);


ALTER TYPE public."MessageType" OWNER TO salad;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."Priority" OWNER TO salad;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: salad
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO salad;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "checkInTime" timestamp(3) without time zone,
    "checkOutTime" timestamp(3) without time zone,
    "totalHours" double precision,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PRESENT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO salad;

--
-- Name: BankDetails; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."BankDetails" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountTitle" text NOT NULL,
    "branchCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BankDetails" OWNER TO salad;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    "messageType" public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    "fileUrl" text,
    "fileName" text,
    "fileSize" integer,
    "mimeType" text,
    "parentMessageId" text,
    "forwardedFrom" text,
    "isEdited" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO salad;

--
-- Name: ChatParticipant; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."ChatParticipant" (
    id text NOT NULL,
    "roomId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastReadAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."ChatParticipant" OWNER TO salad;

--
-- Name: ChatRoom; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."ChatRoom" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type public."ChatRoomType" NOT NULL,
    "teamId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatRoom" OWNER TO salad;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."DocumentType" NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Document" OWNER TO salad;

--
-- Name: Education; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Education" (
    id text NOT NULL,
    "userId" text NOT NULL,
    degree text NOT NULL,
    institution text NOT NULL,
    field text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    grade text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Education" OWNER TO salad;

--
-- Name: EmergencyContact; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."EmergencyContact" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    relationship text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmergencyContact" OWNER TO salad;

--
-- Name: Experience; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Experience" (
    id text NOT NULL,
    "userId" text NOT NULL,
    company text NOT NULL,
    "position" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Experience" OWNER TO salad;

--
-- Name: Hosting; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Hosting" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    domain text NOT NULL,
    cost double precision NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "durationType" public."DurationType" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Hosting" OWNER TO salad;

--
-- Name: Leave; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Leave" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    type public."LeaveType" NOT NULL,
    status public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    reason text NOT NULL,
    "managerId" text,
    "adminId" text,
    "managerStatus" public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "adminStatus" public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "managerComment" text,
    "adminComment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Leave" OWNER TO salad;

--
-- Name: Meeting; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Meeting" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    color text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Meeting" OWNER TO salad;

--
-- Name: MessageReadStatus; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."MessageReadStatus" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    "userId" text NOT NULL,
    "readAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MessageReadStatus" OWNER TO salad;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    "timestamp" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO salad;

--
-- Name: Performance; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Performance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    score integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Performance" OWNER TO salad;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    resource text NOT NULL,
    action text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Permission" OWNER TO salad;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "managerName" text NOT NULL,
    "joinDate" timestamp(3) without time zone NOT NULL,
    "tasksDone" integer NOT NULL,
    "totalTasks" integer NOT NULL,
    "timeSpentHours" integer NOT NULL,
    "totalHours" integer NOT NULL,
    progress integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Project" OWNER TO salad;

--
-- Name: ProjectAssignment; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."ProjectAssignment" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProjectAssignment" OWNER TO salad;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO salad;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO salad;

--
-- Name: Skill; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Skill" (
    id text NOT NULL,
    name text NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Skill" OWNER TO salad;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'PENDING'::public."TaskStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "assignedTo" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Task" OWNER TO salad;

--
-- Name: Team; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."Team" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "leaderId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Team" OWNER TO salad;

--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."TeamMember" (
    id text NOT NULL,
    "teamId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeamMember" OWNER TO salad;

--
-- Name: User; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    cnic text NOT NULL,
    pfp text,
    password text NOT NULL,
    salary double precision NOT NULL,
    address text NOT NULL,
    department text NOT NULL,
    "position" text NOT NULL,
    "joinDate" timestamp(3) without time zone NOT NULL,
    phone text,
    role public."LegacyRole" DEFAULT 'EMPLOYEE'::public."LegacyRole" NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    gender public."Gender",
    "maritalStatus" public."MaritalStatus",
    "reportsToId" text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO salad;

--
-- Name: UserLastSeen; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."UserLastSeen" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "lastSeen" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isOnline" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserLastSeen" OWNER TO salad;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: salad
--

CREATE TABLE public."UserRole" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO salad;

--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Attendance" (id, "userId", "checkInTime", "checkOutTime", "totalHours", date, status, "createdAt", "updatedAt") FROM stdin;
cmdhf9zev0004fi0zphp0109w	cmdhf9zdt0000fi0zevfqomye	\N	2025-06-01 21:42:43	\N	2025-05-31 19:00:00	PRESENT	2025-07-24 13:22:45.511	2025-07-24 13:22:45.511
cmdhf9zf60006fi0z9scmk1f3	cmdhf9zdt0000fi0zevfqomye	2025-06-02 14:44:39	\N	\N	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:45.522	2025-07-24 13:22:45.522
cmdhf9zfi0008fi0zqd1a5c06	cmdhf9zdt0000fi0zevfqomye	2025-06-03 10:34:03	2025-06-03 19:28:49	8.91	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:45.534	2025-07-24 13:22:45.534
cmdhf9zft000afi0zy8u1ekpc	cmdhf9zdt0000fi0zevfqomye	2025-06-04 14:26:27	2025-06-04 17:36:54	3.17	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:45.545	2025-07-24 13:22:45.545
cmdhf9zg5000cfi0zqpvj9cri	cmdhf9zdt0000fi0zevfqomye	2025-06-05 14:43:45	2025-06-05 17:40:46	2.95	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:45.557	2025-07-24 13:22:45.557
cmdhf9zgf000efi0zsi9n6to9	cmdhf9zdt0000fi0zevfqomye	\N	2025-06-06 15:38:33	\N	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:45.568	2025-07-24 13:22:45.568
cmdhf9zgo000gfi0z00w1tmeq	cmdhf9zdt0000fi0zevfqomye	2025-06-09 12:47:28	2025-06-09 18:58:06	6.18	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:45.576	2025-07-24 13:22:45.576
cmdhf9zgw000ifi0zlnnuwyg3	cmdhf9zdt0000fi0zevfqomye	2025-06-10 14:00:53	2025-06-10 21:28:38	7.46	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:45.584	2025-07-24 13:22:45.584
cmdhf9zh3000kfi0zouqvw713	cmdhf9zdt0000fi0zevfqomye	2025-06-11 12:53:43	2025-06-11 20:55:02	8.02	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:45.591	2025-07-24 13:22:45.591
cmdhf9zh8000mfi0zuozwb16m	cmdhf9zdt0000fi0zevfqomye	2025-06-12 14:28:46	2025-06-12 20:43:02	6.24	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:45.596	2025-07-24 13:22:45.596
cmdhf9zhf000ofi0zhha0lgt3	cmdhf9zdt0000fi0zevfqomye	2025-06-13 09:50:07	2025-06-13 20:40:36	10.84	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:45.603	2025-07-24 13:22:45.603
cmdhf9zhl000qfi0zn3r6wjn4	cmdhf9zdt0000fi0zevfqomye	2025-06-14 13:50:32	2025-06-14 20:37:39	6.79	2025-06-13 19:00:00	PRESENT	2025-07-24 13:22:45.61	2025-07-24 13:22:45.61
cmdhf9zhw000sfi0z4geckjpe	cmdhf9zdt0000fi0zevfqomye	2025-06-16 12:51:57	2025-06-16 20:52:13	8	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:45.621	2025-07-24 13:22:45.621
cmdhf9zi3000ufi0zetju9yq8	cmdhf9zdt0000fi0zevfqomye	2025-06-17 12:41:24	\N	\N	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:45.628	2025-07-24 13:22:45.628
cmdhf9zib000wfi0zecmac5qf	cmdhf9zdt0000fi0zevfqomye	2025-06-18 12:35:46	2025-06-18 20:14:50	7.65	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:45.635	2025-07-24 13:22:45.635
cmdhf9zii000yfi0zlkxlrffx	cmdhf9zdt0000fi0zevfqomye	2025-06-19 13:35:14	2025-06-19 23:45:04	10.16	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:45.643	2025-07-24 13:22:45.643
cmdhf9ziq0010fi0z22f35x0y	cmdhf9zdt0000fi0zevfqomye	2025-06-20 12:26:32	2025-06-20 19:49:42	7.39	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:45.65	2025-07-24 13:22:45.65
cmdhf9zix0012fi0zgpc7ob53	cmdhf9zdt0000fi0zevfqomye	2025-06-21 12:59:50	\N	\N	2025-06-20 19:00:00	PRESENT	2025-07-24 13:22:45.658	2025-07-24 13:22:45.658
cmdhf9zj40014fi0zh7r00yzc	cmdhf9zdt0000fi0zevfqomye	2025-06-23 12:20:22	2025-06-23 22:35:57	10.26	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:45.664	2025-07-24 13:22:45.664
cmdhf9zje0016fi0z32fs42nc	cmdhf9zdt0000fi0zevfqomye	2025-06-24 13:28:47	2025-06-24 16:35:49	3.12	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:45.674	2025-07-24 13:22:45.674
cmdhf9zjm0018fi0zvux7upuo	cmdhf9zdt0000fi0zevfqomye	2025-06-25 12:34:00	2025-06-25 20:38:07	8.07	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:45.682	2025-07-24 13:22:45.682
cmdhf9zju001afi0zmy7u0hkf	cmdhf9zdt0000fi0zevfqomye	2025-06-26 12:27:01	2025-06-26 20:17:41	7.84	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:45.69	2025-07-24 13:22:45.69
cmdhf9zk1001cfi0zb0px0apv	cmdhf9zdt0000fi0zevfqomye	2025-06-27 11:25:53	2025-06-27 22:37:49	11.2	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:45.697	2025-07-24 13:22:45.697
cmdhf9zkb001efi0zy5ggvxqz	cmdhf9zdt0000fi0zevfqomye	2025-06-28 14:11:43	2025-06-28 19:58:27	5.78	2025-06-27 19:00:00	PRESENT	2025-07-24 13:22:45.707	2025-07-24 13:22:45.707
cmdhf9zkh001gfi0z9162h6rp	cmdhf9zdt0000fi0zevfqomye	2025-06-30 13:38:50	2025-06-30 18:36:38	4.96	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:45.713	2025-07-24 13:22:45.713
cmdhf9zkq001ifi0zwg9qp8fn	cmdhf9zdt0000fi0zevfqomye	2025-07-01 14:49:46	2025-07-01 15:23:30	0.56	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:45.722	2025-07-24 13:22:45.722
cmdhf9zl6001kfi0zc6h7bkb9	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-02 13:23:07	2025-06-02 22:04:26	8.69	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:45.738	2025-07-24 13:22:45.738
cmdhf9zld001mfi0zszxss6sj	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-03 13:14:45	2025-06-03 21:47:13	8.54	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:45.746	2025-07-24 13:22:45.746
cmdhf9zlo001ofi0z1k2vlna2	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-04 13:26:55	2025-06-04 22:12:18	8.76	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:45.756	2025-07-24 13:22:45.756
cmdhf9zm8001qfi0zeptlpv4d	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-05 14:41:12	2025-06-05 22:28:41	7.79	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:45.776	2025-07-24 13:22:45.776
cmdhf9zn8001sfi0zq5rnkchr	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-06 12:07:36	2025-06-06 16:37:32	4.5	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:45.812	2025-07-24 13:22:45.812
cmdhf9znh001ufi0zfbrc5bd9	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-10 12:27:35	2025-06-10 21:14:13	8.78	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:45.822	2025-07-24 13:22:45.822
cmdhf9zno001wfi0zotyc3avf	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-11 12:48:57	2025-06-11 21:29:21	8.67	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:45.828	2025-07-24 13:22:45.828
cmdhf9znu001yfi0zx3z3ax36	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-12 13:43:44	2025-06-12 22:46:07	9.04	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:45.835	2025-07-24 13:22:45.835
cmdhf9zo20020fi0zeqrb3l0g	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-13 13:52:49	2025-06-13 22:31:57	8.65	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:45.842	2025-07-24 13:22:45.842
cmdhf9zo90022fi0zbt05sf54	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-16 12:57:41	2025-06-16 21:37:32	8.66	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:45.849	2025-07-24 13:22:45.849
cmdhf9zog0024fi0znons0km8	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-17 13:29:34	2025-06-17 22:02:20	8.55	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:45.856	2025-07-24 13:22:45.856
cmdhf9zom0026fi0z8y7esofo	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-18 13:10:39	2025-06-18 21:47:31	8.61	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:45.862	2025-07-24 13:22:45.862
cmdhf9zot0028fi0z7pzxobux	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-19 13:16:01	2025-06-19 21:59:43	8.73	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:45.869	2025-07-24 13:22:45.869
cmdhf9zp1002afi0zsqu2ms9s	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-20 12:57:11	2025-06-20 21:43:32	8.77	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:45.877	2025-07-24 13:22:45.877
cmdhf9zp7002cfi0z06vp1z85	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-23 13:01:23	2025-06-23 22:00:21	8.98	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:45.883	2025-07-24 13:22:45.883
cmdhf9zpf002efi0zrfqfyaig	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-24 13:04:32	2025-06-24 21:39:56	8.59	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:45.891	2025-07-24 13:22:45.891
cmdhf9zpl002gfi0zwn57e13q	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-25 13:31:09	2025-06-25 22:05:57	8.58	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:45.897	2025-07-24 13:22:45.897
cmdhf9zps002ifi0zpw3cu5go	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-26 13:39:03	2025-06-26 22:14:06	8.58	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:45.905	2025-07-24 13:22:45.905
cmdhf9zpy002kfi0z9gepw3bq	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-27 13:01:17	2025-06-27 22:00:12	8.98	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:45.911	2025-07-24 13:22:45.911
cmdhf9zq6002mfi0z5rtdenv7	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-28 15:54:26	2025-06-28 19:58:12	4.06	2025-06-27 19:00:00	PRESENT	2025-07-24 13:22:45.918	2025-07-24 13:22:45.918
cmdhf9zqd002ofi0zcvgn1si2	cmdg7mc8d0000fi9xjjn2sq2y	2025-06-30 13:26:49	2025-06-30 22:04:45	8.63	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:45.925	2025-07-24 13:22:45.925
cmdhf9zqi002qfi0zg8nauwxt	cmdg7mc8d0000fi9xjjn2sq2y	2025-07-01 12:31:04	2025-07-01 17:17:47	4.78	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:45.931	2025-07-24 13:22:45.931
cmdhf9zqt002sfi0z4i836l53	cmdg7mczw0003fi9xa53xjuqy	2025-06-02 13:23:02	2025-06-02 22:04:30	8.69	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:45.942	2025-07-24 13:22:45.942
cmdhf9zr0002ufi0zi7ceb8jt	cmdg7mczw0003fi9xa53xjuqy	2025-06-03 13:14:58	2025-06-03 21:47:10	8.54	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:45.948	2025-07-24 13:22:45.948
cmdhf9zr7002wfi0zzujc64i3	cmdg7mczw0003fi9xa53xjuqy	2025-06-04 13:27:03	2025-06-04 22:12:16	8.75	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:45.956	2025-07-24 13:22:45.956
cmdhf9zre002yfi0znj4eaoxf	cmdg7mczw0003fi9xa53xjuqy	2025-06-05 13:55:18	2025-06-05 22:28:45	8.56	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:45.962	2025-07-24 13:22:45.962
cmdhf9zrl0030fi0zkp9m6f6k	cmdg7mczw0003fi9xa53xjuqy	2025-06-06 11:50:10	2025-06-06 16:30:19	4.67	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:45.969	2025-07-24 13:22:45.969
cmdhf9zrs0032fi0zww22akyr	cmdg7mczw0003fi9xa53xjuqy	2025-06-09 12:56:09	2025-06-09 21:41:51	8.76	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:45.976	2025-07-24 13:22:45.976
cmdhf9zrz0034fi0zx9jviyh2	cmdg7mczw0003fi9xa53xjuqy	2025-06-10 13:13:55	2025-06-10 21:50:20	8.61	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:45.983	2025-07-24 13:22:45.983
cmdhf9zs50036fi0zogq91ojs	cmdg7mczw0003fi9xa53xjuqy	2025-06-11 12:48:59	2025-06-11 21:29:17	8.67	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:45.989	2025-07-24 13:22:45.989
cmdhf9zsb0038fi0z2g39fkpx	cmdg7mczw0003fi9xa53xjuqy	2025-06-12 13:12:42	2025-06-12 21:45:20	8.54	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:45.995	2025-07-24 13:22:45.995
cmdhf9zsh003afi0zavt1j6zn	cmdg7mczw0003fi9xa53xjuqy	2025-06-13 12:59:50	2025-06-13 21:46:16	8.77	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:46.001	2025-07-24 13:22:46.001
cmdhf9zsn003cfi0znu800fo7	cmdg7mczw0003fi9xa53xjuqy	2025-06-16 12:56:59	2025-06-16 21:37:35	8.68	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:46.007	2025-07-24 13:22:46.007
cmdhf9zss003efi0zemabjz63	cmdg7mczw0003fi9xa53xjuqy	2025-06-17 13:29:27	2025-06-17 22:01:52	8.54	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:46.012	2025-07-24 13:22:46.012
cmdhf9zsy003gfi0zivdt3tq3	cmdg7mczw0003fi9xa53xjuqy	2025-06-18 13:10:30	2025-06-18 21:47:35	8.62	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:46.018	2025-07-24 13:22:46.018
cmdhf9zt5003ifi0zuuiih0yk	cmdg7mczw0003fi9xa53xjuqy	2025-06-19 13:15:55	2025-06-19 21:58:43	8.71	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:46.026	2025-07-24 13:22:46.026
cmdhf9ztd003kfi0z4rxtx6ud	cmdg7mczw0003fi9xa53xjuqy	2025-06-20 12:57:08	2025-06-20 21:43:30	8.77	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:46.033	2025-07-24 13:22:46.033
cmdhf9ztl003mfi0zl2g4m993	cmdg7mczw0003fi9xa53xjuqy	2025-06-23 13:01:16	2025-06-23 21:59:30	8.97	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:46.041	2025-07-24 13:22:46.041
cmdhf9ztx003ofi0znc1gn57m	cmdg7mczw0003fi9xa53xjuqy	2025-06-24 15:54:45	2025-06-24 21:39:47	5.75	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:46.053	2025-07-24 13:22:46.053
cmdhf9zu6003qfi0zapexml6o	cmdg7mczw0003fi9xa53xjuqy	2025-06-25 13:30:06	2025-06-25 22:03:20	8.55	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:46.062	2025-07-24 13:22:46.062
cmdhf9zug003sfi0zi3gruafy	cmdg7mczw0003fi9xa53xjuqy	2025-06-26 13:38:59	2025-06-26 22:14:09	8.59	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:46.072	2025-07-24 13:22:46.072
cmdhf9zuq003ufi0zcv4f0nqa	cmdg7mczw0003fi9xa53xjuqy	2025-06-27 13:00:22	2025-06-27 22:00:03	8.99	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:46.082	2025-07-24 13:22:46.082
cmdhf9zv2003wfi0z4fd2v5vp	cmdg7mczw0003fi9xa53xjuqy	2025-06-30 12:39:28	2025-06-30 21:26:12	8.78	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:46.094	2025-07-24 13:22:46.094
cmdhf9zvc003yfi0zhp8151ru	cmdg7mczw0003fi9xa53xjuqy	2025-07-01 13:06:38	2025-07-01 18:50:32	5.73	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:46.105	2025-07-24 13:22:46.105
cmdhf9zvy0040fi0z2qiqarhx	cmdg7mdsy0006fi9x6vdw91re	2025-06-03 17:45:59	2025-06-03 22:11:03	4.42	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:46.126	2025-07-24 13:22:46.126
cmdhf9zw90042fi0zw565dk1s	cmdg7mdsy0006fi9x6vdw91re	2025-06-05 16:54:19	2025-06-05 22:09:08	5.25	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:46.137	2025-07-24 13:22:46.137
cmdhf9zwk0044fi0z6oo2qo28	cmdg7mdsy0006fi9x6vdw91re	2025-06-12 17:04:05	2025-06-12 21:46:50	4.71	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:46.148	2025-07-24 13:22:46.148
cmdhf9zwx0046fi0zqmecm8iy	cmdg7mdsy0006fi9x6vdw91re	2025-06-17 15:53:31	2025-06-17 21:10:03	5.28	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:46.161	2025-07-24 13:22:46.161
cmdhf9zx80048fi0zo23gdgnl	cmdg7mdsy0006fi9x6vdw91re	2025-06-20 18:14:41	2025-06-20 22:00:58	3.77	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:46.172	2025-07-24 13:22:46.172
cmdhf9zxk004afi0zna6gh4mw	cmdg7mdsy0006fi9x6vdw91re	2025-06-23 16:46:12	2025-06-23 22:28:12	5.7	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:46.184	2025-07-24 13:22:46.184
cmdhf9zxw004cfi0zlfcrlyol	cmdg7mdsy0006fi9x6vdw91re	2025-06-27 16:50:54	2025-06-27 18:40:47	1.83	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:46.197	2025-07-24 13:22:46.197
cmdhf9zyj004efi0zbir68303	cmdg7mekt0009fi9xq0jez3n6	2025-06-02 12:54:26	2025-06-02 17:33:58	4.66	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:46.219	2025-07-24 13:22:46.219
cmdhf9zz5004gfi0z573ctdzf	cmdg7mekt0009fi9xq0jez3n6	2025-06-03 13:12:12	2025-06-03 17:49:13	4.62	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:46.241	2025-07-24 13:22:46.241
cmdhf9zzc004ifi0zeojsb634	cmdg7mekt0009fi9xq0jez3n6	2025-06-04 12:47:34	2025-06-04 17:33:56	4.77	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:46.248	2025-07-24 13:22:46.248
cmdhf9zzk004kfi0z5mz3kjll	cmdg7mekt0009fi9xq0jez3n6	2025-06-05 12:08:05	2025-06-05 16:35:20	4.45	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:46.256	2025-07-24 13:22:46.256
cmdhf9zzu004mfi0z01yrb4ue	cmdg7mekt0009fi9xq0jez3n6	2025-06-06 12:36:30	2025-06-06 17:11:40	4.59	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:46.266	2025-07-24 13:22:46.266
cmdhfa003004ofi0z0dltpf8e	cmdg7mekt0009fi9xq0jez3n6	2025-06-09 11:15:37	2025-06-09 16:29:32	5.23	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:46.275	2025-07-24 13:22:46.275
cmdhfa00a004qfi0zk6ses8mf	cmdg7mekt0009fi9xq0jez3n6	2025-06-10 11:41:23	2025-06-10 16:16:42	4.59	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:46.282	2025-07-24 13:22:46.282
cmdhfa00j004sfi0zwz19dxd4	cmdg7mekt0009fi9xq0jez3n6	2025-06-11 11:56:17	2025-06-11 17:48:50	5.88	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:46.291	2025-07-24 13:22:46.291
cmdhfa00r004ufi0zxek5eo25	cmdg7mekt0009fi9xq0jez3n6	2025-06-12 11:28:53	2025-06-12 16:12:21	4.72	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:46.299	2025-07-24 13:22:46.299
cmdhfa00z004wfi0z1xu2ztn9	cmdg7mekt0009fi9xq0jez3n6	2025-06-13 14:40:20	2025-06-13 16:00:43	1.34	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:46.307	2025-07-24 13:22:46.307
cmdhfa018004yfi0zqjws5asv	cmdg7mekt0009fi9xq0jez3n6	2025-06-16 10:57:04	2025-06-16 15:54:51	4.96	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:46.316	2025-07-24 13:22:46.316
cmdhfa01f0050fi0zixpmlhsj	cmdg7mekt0009fi9xq0jez3n6	2025-06-17 12:21:01	2025-06-17 16:00:30	3.66	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:46.324	2025-07-24 13:22:46.324
cmdhfa01n0052fi0zydkfvzhf	cmdg7mekt0009fi9xq0jez3n6	2025-06-18 12:12:10	2025-06-18 16:28:23	4.27	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:46.331	2025-07-24 13:22:46.331
cmdhfa01u0054fi0z5xd05s7v	cmdg7mekt0009fi9xq0jez3n6	2025-06-19 11:52:41	2025-06-19 16:24:53	4.54	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:46.339	2025-07-24 13:22:46.339
cmdhfa0220056fi0zhpevyre0	cmdg7mekt0009fi9xq0jez3n6	2025-06-20 11:53:25	2025-06-20 16:23:04	4.49	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:46.346	2025-07-24 13:22:46.346
cmdhfa02h0058fi0z07hsv0z1	cmdg7mekt0009fi9xq0jez3n6	2025-06-23 11:39:58	2025-06-23 16:10:47	4.51	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:46.361	2025-07-24 13:22:46.361
cmdhfa02r005afi0za0eoof3w	cmdg7mekt0009fi9xq0jez3n6	2025-06-24 12:12:31	2025-06-24 17:15:41	5.05	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:46.371	2025-07-24 13:22:46.371
cmdhfa031005cfi0zt20t64xa	cmdg7mekt0009fi9xq0jez3n6	2025-06-25 12:11:41	2025-06-25 16:57:29	4.76	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:46.381	2025-07-24 13:22:46.381
cmdhfa03b005efi0z9s4k41ue	cmdg7mekt0009fi9xq0jez3n6	2025-06-26 11:20:31	2025-06-26 15:55:46	4.59	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:46.391	2025-07-24 13:22:46.391
cmdhfa03t005gfi0z4xwqvmoo	cmdg7mekt0009fi9xq0jez3n6	2025-06-27 12:07:50	2025-06-27 17:25:30	5.29	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:46.41	2025-07-24 13:22:46.41
cmdhfa03z005ifi0z8fqf30pj	cmdg7mekt0009fi9xq0jez3n6	2025-06-30 11:21:19	2025-06-30 16:43:56	5.38	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:46.415	2025-07-24 13:22:46.415
cmdhfa047005kfi0zleobhdhc	cmdg7mekt0009fi9xq0jez3n6	2025-07-01 12:15:09	2025-07-01 17:12:15	4.95	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:46.423	2025-07-24 13:22:46.423
cmdhfa04i005mfi0zowr119qr	cmdg7mfax000cfi9xmhek342g	2025-06-02 13:30:09	2025-06-02 22:07:35	8.62	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:46.434	2025-07-24 13:22:46.434
cmdhfa04r005ofi0zwaame1h6	cmdg7mfax000cfi9xmhek342g	2025-06-03 12:20:22	2025-06-03 16:49:52	4.49	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:46.443	2025-07-24 13:22:46.443
cmdhfa051005qfi0zb3to64lq	cmdg7mfax000cfi9xmhek342g	2025-06-04 13:34:37	2025-06-04 22:11:13	8.61	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:46.453	2025-07-24 13:22:46.453
cmdhfa05c005sfi0zb3jnep3w	cmdg7mfax000cfi9xmhek342g	2025-06-05 13:13:41	2025-06-05 21:56:53	8.72	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:46.465	2025-07-24 13:22:46.465
cmdhfa05l005ufi0zajlzqy3s	cmdg7mfax000cfi9xmhek342g	2025-06-06 13:11:01	2025-06-06 21:44:13	8.55	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:46.473	2025-07-24 13:22:46.473
cmdhfa05s005wfi0zl8yqn53g	cmdg7mfax000cfi9xmhek342g	2025-06-09 13:34:34	2025-06-09 22:10:32	8.6	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:46.481	2025-07-24 13:22:46.481
cmdhfa061005yfi0zyqu559j0	cmdg7mfax000cfi9xmhek342g	2025-06-10 13:09:35	2025-06-10 21:46:59	8.62	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:46.49	2025-07-24 13:22:46.49
cmdhfa06a0060fi0za3h78oc8	cmdg7mfax000cfi9xmhek342g	2025-06-11 13:05:10	2025-06-11 21:45:23	8.67	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:46.498	2025-07-24 13:22:46.498
cmdhfa06q0062fi0z8igc2kmc	cmdg7mfax000cfi9xmhek342g	2025-06-12 13:14:56	2025-06-12 21:54:45	8.66	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:46.514	2025-07-24 13:22:46.514
cmdhfa06y0064fi0z6fin8mpt	cmdg7mfax000cfi9xmhek342g	2025-06-13 13:10:08	2025-06-13 21:57:38	8.79	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:46.522	2025-07-24 13:22:46.522
cmdhfa07h0066fi0z0iepxv8a	cmdg7mfax000cfi9xmhek342g	2025-06-16 13:09:58	2025-06-16 21:48:13	8.64	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:46.541	2025-07-24 13:22:46.541
cmdhfa07n0068fi0z1o1hrh0w	cmdg7mfax000cfi9xmhek342g	2025-06-17 12:58:56	2025-06-17 21:44:01	8.75	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:46.548	2025-07-24 13:22:46.548
cmdhfa07v006afi0z30w0cqwj	cmdg7mfax000cfi9xmhek342g	2025-06-18 13:05:29	2025-06-18 21:47:42	8.7	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:46.555	2025-07-24 13:22:46.555
cmdhfa085006cfi0z0xf5uhp8	cmdg7mfax000cfi9xmhek342g	2025-06-19 13:09:25	2025-06-19 21:50:26	8.68	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:46.565	2025-07-24 13:22:46.565
cmdhfa08f006efi0zurvzc1rw	cmdg7mfax000cfi9xmhek342g	2025-06-20 13:06:29	2025-06-20 21:47:08	8.68	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:46.575	2025-07-24 13:22:46.575
cmdhfa08q006gfi0z5xkbt8me	cmdg7mfax000cfi9xmhek342g	2025-06-23 13:07:20	2025-06-23 21:59:48	8.87	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:46.586	2025-07-24 13:22:46.586
cmdhfa08z006ifi0z52qbxevh	cmdg7mfax000cfi9xmhek342g	2025-06-24 13:03:37	2025-06-24 21:41:51	8.64	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:46.595	2025-07-24 13:22:46.595
cmdhfa09a006kfi0z4mc8o1et	cmdg7mfax000cfi9xmhek342g	2025-06-25 13:22:28	2025-06-25 22:01:30	8.65	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:46.606	2025-07-24 13:22:46.606
cmdhfa09k006mfi0zh9k22rcq	cmdg7mfax000cfi9xmhek342g	2025-06-26 13:08:02	2025-06-26 21:48:34	8.68	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:46.616	2025-07-24 13:22:46.616
cmdhfa09t006ofi0zpoznrrvq	cmdg7mfax000cfi9xmhek342g	2025-06-27 13:11:12	2025-06-27 22:03:50	8.88	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:46.625	2025-07-24 13:22:46.625
cmdhfa0a3006qfi0zg4gw7xv6	cmdg7mfax000cfi9xmhek342g	2025-06-30 13:30:29	2025-06-30 22:07:02	8.61	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:46.635	2025-07-24 13:22:46.635
cmdhfa0ad006sfi0z8guoyxk8	cmdg7mfax000cfi9xmhek342g	2025-07-01 13:00:44	2025-07-01 17:18:31	4.3	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:46.646	2025-07-24 13:22:46.646
cmdhfa0ax006ufi0z69pu3hh0	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-02 14:35:17	2025-06-02 22:07:31	7.54	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:46.665	2025-07-24 13:22:46.665
cmdhfa0b7006wfi0zsn7pq5be	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-03 16:11:54	2025-06-03 22:09:56	5.97	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:46.675	2025-07-24 13:22:46.675
cmdhfa0bh006yfi0z0uewyba0	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-04 14:24:37	2025-06-04 22:58:24	8.56	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:46.685	2025-07-24 13:22:46.685
cmdhfa0br0070fi0z4s5692yg	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-05 14:32:21	2025-06-05 22:41:46	8.16	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:46.695	2025-07-24 13:22:46.695
cmdhfa0c10072fi0zu8obgc6v	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-06 12:59:29	2025-06-06 19:43:30	6.73	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:46.705	2025-07-24 13:22:46.705
cmdhfa0cc0074fi0zonuzxiu8	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-10 13:58:29	2025-06-10 22:30:37	8.54	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:46.716	2025-07-24 13:22:46.716
cmdhfa0co0076fi0zis0mup0a	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-11 14:02:19	2025-06-11 22:35:35	8.55	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:46.728	2025-07-24 13:22:46.728
cmdhfa0d70078fi0zufcnwfyp	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-12 14:07:19	2025-06-12 22:43:16	8.6	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:46.748	2025-07-24 13:22:46.748
cmdhfa0do007afi0zphmlip44	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-13 14:16:51	2025-06-13 22:47:38	8.51	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:46.764	2025-07-24 13:22:46.764
cmdhfa0dx007cfi0z2t9j8jn0	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-16 13:42:07	2025-06-16 22:14:40	8.54	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:46.773	2025-07-24 13:22:46.773
cmdhfa0ec007efi0zxvb7hqxu	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-17 13:26:46	2025-06-17 22:01:27	8.58	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:46.786	2025-07-24 13:22:46.786
cmdhfa0eo007gfi0z1jazvjsi	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-18 13:30:58	2025-06-18 22:03:01	8.53	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:46.801	2025-07-24 13:22:46.801
cmdhfa0ey007ifi0zpp1d5s9q	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-19 12:51:14	2025-06-19 19:46:05	6.91	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:46.81	2025-07-24 13:22:46.81
cmdhfa0f9007kfi0zzfu5w0zd	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-20 13:18:34	2025-06-20 21:58:14	8.66	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:46.821	2025-07-24 13:22:46.821
cmdhfa0fl007mfi0zgtbqxm36	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-23 13:56:44	2025-06-23 22:34:57	8.64	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:46.833	2025-07-24 13:22:46.833
cmdhfa0g9007ofi0zxmsu9h2k	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-24 13:23:07	2025-06-24 22:00:42	8.63	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:46.857	2025-07-24 13:22:46.857
cmdhfa0gn007qfi0zlb78jeum	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-25 13:02:58	2025-06-25 21:36:38	8.56	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:46.871	2025-07-24 13:22:46.871
cmdhfa0h3007sfi0zyo3y56au	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-26 13:39:09	2025-06-26 22:13:01	8.56	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:46.887	2025-07-24 13:22:46.887
cmdhfa0hc007ufi0zzjm6yo32	cmdg7mg0n000ffi9x0lnmxjzq	2025-06-27 14:54:11	2025-06-27 22:39:33	7.76	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:46.896	2025-07-24 13:22:46.896
cmdhfa0hm007wfi0zmkp5fvxw	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-01 12:45:31	2025-07-01 12:47:42	0.04	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:46.906	2025-07-24 13:22:46.906
cmdhfa0i2007yfi0zasfb5tjd	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-02 11:53:12	2025-06-02 20:23:41	8.51	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:46.923	2025-07-24 13:22:46.923
cmdhfa0ig0080fi0z5g3w838w	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-03 11:54:14	2025-06-03 20:30:11	8.6	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:46.936	2025-07-24 13:22:46.936
cmdhfa0iv0082fi0z1e146wv8	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-04 12:07:54	2025-06-04 21:28:28	9.34	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:46.951	2025-07-24 13:22:46.951
cmdhfa0j70084fi0z4orcxlpj	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-05 11:50:30	2025-06-05 20:50:16	9	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:46.963	2025-07-24 13:22:46.963
cmdhfa0jg0086fi0zcgqj5gcv	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-06 18:34:02	2025-06-06 21:43:39	3.16	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:46.972	2025-07-24 13:22:46.972
cmdhfa0jq0088fi0zza4orqhc	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-09 11:58:07	2025-06-09 19:01:25	7.06	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:46.982	2025-07-24 13:22:46.982
cmdhfa0jw008afi0z7rr4r2e9	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-10 12:06:20	2025-06-10 20:29:54	8.39	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:46.989	2025-07-24 13:22:46.989
cmdhfa0k2008cfi0z7qbsur36	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-11 11:56:48	2025-06-11 21:43:00	9.77	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:46.994	2025-07-24 13:22:46.994
cmdhfa0k8008efi0zm0wb2646	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-12 12:08:04	2025-06-12 21:00:25	8.87	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:47	2025-07-24 13:22:47
cmdhfa0kf008gfi0zn31orpoj	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-13 12:08:17	2025-06-13 21:17:00	9.15	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:47.007	2025-07-24 13:22:47.007
cmdhfa0kk008ifi0zkp3dkx6q	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-14 13:36:32	2025-06-14 17:37:12	4.01	2025-06-13 19:00:00	PRESENT	2025-07-24 13:22:47.013	2025-07-24 13:22:47.013
cmdhfa0kp008kfi0zjf07da5g	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-16 12:02:12	2025-06-16 20:51:42	8.82	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:47.018	2025-07-24 13:22:47.018
cmdhfa0kv008mfi0zhmtxiumk	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-17 12:02:01	2025-06-17 20:38:29	8.61	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:47.024	2025-07-24 13:22:47.024
cmdhfa0l5008ofi0z7v71if7v	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-18 12:12:14	2025-06-18 20:46:32	8.57	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:47.034	2025-07-24 13:22:47.034
cmdhfa0ls008qfi0zat106mcl	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-19 11:59:14	2025-06-19 20:45:15	8.77	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:47.056	2025-07-24 13:22:47.056
cmdhfa0mh008sfi0zd13qq61h	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-20 12:05:14	2025-06-20 21:03:33	8.97	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:47.082	2025-07-24 13:22:47.082
cmdhfa0mq008ufi0ziokdpfox	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-23 12:11:40	2025-06-23 22:44:37	10.55	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:47.09	2025-07-24 13:22:47.09
cmdhfa0n2008wfi0z1gbq09o6	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-24 12:12:46	2025-06-24 20:57:29	8.75	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:47.102	2025-07-24 13:22:47.102
cmdhfa0nd008yfi0zi59ok9ln	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-25 12:06:19	2025-06-25 21:04:08	8.96	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:47.113	2025-07-24 13:22:47.113
cmdhfa0nl0090fi0zzcju1ua6	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-26 12:02:44	2025-06-26 20:50:23	8.79	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:47.121	2025-07-24 13:22:47.121
cmdhfa0nv0092fi0z5mse8f79	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-27 13:00:59	2025-06-27 22:04:47	9.06	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:47.131	2025-07-24 13:22:47.131
cmdhfa0o40094fi0zil0554x4	cmdg7mgpt000ifi9xhbw7rjg3	2025-06-30 12:44:53	2025-06-30 20:58:02	8.22	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:47.14	2025-07-24 13:22:47.14
cmdhfa0oc0096fi0zue925glu	cmdg7mgpt000ifi9xhbw7rjg3	2025-07-01 12:10:55	2025-07-01 16:00:53	3.83	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:47.148	2025-07-24 13:22:47.148
cmdhfa0oq0098fi0zhfegwh00	cmdg7mhfv000lfi9xgle1ozjd	2025-06-02 12:54:32	2025-06-02 21:37:44	8.72	2025-06-01 19:00:00	PRESENT	2025-07-24 13:22:47.162	2025-07-24 13:22:47.162
cmdhfa0oy009afi0zn1fkebud	cmdg7mhfv000lfi9xgle1ozjd	2025-06-03 14:35:28	2025-06-03 22:42:07	8.11	2025-06-02 19:00:00	PRESENT	2025-07-24 13:22:47.171	2025-07-24 13:22:47.171
cmdhfa0p6009cfi0z6owu4vlc	cmdg7mhfv000lfi9xgle1ozjd	2025-06-04 13:54:10	2025-06-04 22:29:39	8.59	2025-06-03 19:00:00	PRESENT	2025-07-24 13:22:47.178	2025-07-24 13:22:47.178
cmdhfa0pf009efi0zlugodyan	cmdg7mhfv000lfi9xgle1ozjd	2025-06-05 14:34:32	2025-06-05 22:35:44	8.02	2025-06-04 19:00:00	PRESENT	2025-07-24 13:22:47.187	2025-07-24 13:22:47.187
cmdhfa0pn009gfi0z4vdnfp3j	cmdg7mhfv000lfi9xgle1ozjd	2025-06-06 14:14:02	2025-06-06 21:45:52	7.53	2025-06-05 19:00:00	PRESENT	2025-07-24 13:22:47.195	2025-07-24 13:22:47.195
cmdhfa0pv009ifi0zqhdcuhxb	cmdg7mhfv000lfi9xgle1ozjd	2025-06-09 14:11:31	2025-06-09 22:51:03	8.66	2025-06-08 19:00:00	PRESENT	2025-07-24 13:22:47.203	2025-07-24 13:22:47.203
cmdhfa0q4009kfi0z55bm0akg	cmdg7mhfv000lfi9xgle1ozjd	2025-06-10 13:36:49	2025-06-10 22:52:32	9.26	2025-06-09 19:00:00	PRESENT	2025-07-24 13:22:47.213	2025-07-24 13:22:47.213
cmdhfa0qc009mfi0zpahgj0ub	cmdg7mhfv000lfi9xgle1ozjd	2025-06-11 13:09:42	2025-06-11 21:43:17	8.56	2025-06-10 19:00:00	PRESENT	2025-07-24 13:22:47.22	2025-07-24 13:22:47.22
cmdhfa0qk009ofi0ziipv2lji	cmdg7mhfv000lfi9xgle1ozjd	2025-06-12 14:35:26	2025-06-12 23:08:21	8.55	2025-06-11 19:00:00	PRESENT	2025-07-24 13:22:47.228	2025-07-24 13:22:47.228
cmdhfa0qs009qfi0zt355yj7o	cmdg7mhfv000lfi9xgle1ozjd	2025-06-13 13:35:03	2025-06-13 22:44:53	9.16	2025-06-12 19:00:00	PRESENT	2025-07-24 13:22:47.236	2025-07-24 13:22:47.236
cmdhfa0r1009sfi0zd8fpcs2b	cmdg7mhfv000lfi9xgle1ozjd	2025-06-14 14:24:18	2025-06-14 20:37:41	6.22	2025-06-13 19:00:00	PRESENT	2025-07-24 13:22:47.245	2025-07-24 13:22:47.245
cmdhfa0ra009ufi0zqgquyvij	cmdg7mhfv000lfi9xgle1ozjd	2025-06-16 13:52:46	2025-06-16 22:30:22	8.63	2025-06-15 19:00:00	PRESENT	2025-07-24 13:22:47.254	2025-07-24 13:22:47.254
cmdhfa0ri009wfi0z9atxq959	cmdg7mhfv000lfi9xgle1ozjd	2025-06-17 14:16:09	2025-06-17 22:39:08	8.38	2025-06-16 19:00:00	PRESENT	2025-07-24 13:22:47.262	2025-07-24 13:22:47.262
cmdhfa0rq009yfi0z94x72g0x	cmdg7mhfv000lfi9xgle1ozjd	2025-06-18 12:47:23	2025-06-18 21:27:09	8.66	2025-06-17 19:00:00	PRESENT	2025-07-24 13:22:47.27	2025-07-24 13:22:47.27
cmdhfa0rz00a0fi0zczhbqo65	cmdg7mhfv000lfi9xgle1ozjd	2025-06-19 14:01:43	2025-06-19 22:42:16	8.68	2025-06-18 19:00:00	PRESENT	2025-07-24 13:22:47.279	2025-07-24 13:22:47.279
cmdhfa0s500a2fi0zfnwr0sod	cmdg7mhfv000lfi9xgle1ozjd	2025-06-20 14:25:28	2025-06-21 00:11:19	9.76	2025-06-19 19:00:00	PRESENT	2025-07-24 13:22:47.286	2025-07-24 13:22:47.286
cmdhfa0sd00a4fi0zuy8vgcl1	cmdg7mhfv000lfi9xgle1ozjd	2025-06-23 15:11:07	2025-06-23 23:54:11	8.72	2025-06-22 19:00:00	PRESENT	2025-07-24 13:22:47.293	2025-07-24 13:22:47.293
cmdhfa0sk00a6fi0z2dkise2c	cmdg7mhfv000lfi9xgle1ozjd	2025-06-24 14:38:18	2025-06-24 22:03:28	7.42	2025-06-23 19:00:00	PRESENT	2025-07-24 13:22:47.3	2025-07-24 13:22:47.3
cmdhfa0sr00a8fi0zxs3xuadt	cmdg7mhfv000lfi9xgle1ozjd	2025-06-25 13:30:15	2025-06-25 23:05:40	9.59	2025-06-24 19:00:00	PRESENT	2025-07-24 13:22:47.308	2025-07-24 13:22:47.308
cmdhfa0sz00aafi0zsucimcvg	cmdg7mhfv000lfi9xgle1ozjd	2025-06-26 14:59:37	2025-06-26 23:00:33	8.02	2025-06-25 19:00:00	PRESENT	2025-07-24 13:22:47.315	2025-07-24 13:22:47.315
cmdhfa0t700acfi0zhq37j40y	cmdg7mhfv000lfi9xgle1ozjd	2025-06-27 13:37:22	2025-06-27 23:53:30	10.27	2025-06-26 19:00:00	PRESENT	2025-07-24 13:22:47.323	2025-07-24 13:22:47.323
cmdhfa0te00aefi0zl9lt8i3m	cmdg7mhfv000lfi9xgle1ozjd	2025-06-28 15:34:01	2025-06-28 19:58:43	4.41	2025-06-27 19:00:00	PRESENT	2025-07-24 13:22:47.33	2025-07-24 13:22:47.33
cmdhfa0tn00agfi0zd4wsupos	cmdg7mhfv000lfi9xgle1ozjd	2025-06-30 15:24:09	2025-07-01 00:14:18	8.84	2025-06-29 19:00:00	PRESENT	2025-07-24 13:22:47.339	2025-07-24 13:22:47.339
cmdhfa0tx00aifi0zladgj740	cmdg7mhfv000lfi9xgle1ozjd	2025-07-01 14:48:53	2025-07-01 16:01:13	1.21	2025-06-30 19:00:00	PRESENT	2025-07-24 13:22:47.349	2025-07-24 13:22:47.349
\.


--
-- Data for Name: BankDetails; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."BankDetails" (id, "userId", "bankName", "accountNumber", "accountTitle", "branchCode", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."ChatMessage" (id, "roomId", "senderId", content, "messageType", "fileUrl", "fileName", "fileSize", "mimeType", "parentMessageId", "forwardedFrom", "isEdited", "isDeleted", "createdAt", "updatedAt") FROM stdin;
cmdhjekc50001fioh6ghlbr2o	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	hi	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:18:17.717	2025-07-24 15:18:17.717
cmdhjgued0007fiohvtxjrull	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	hi	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:20:04.069	2025-07-24 15:20:04.069
cmdhjgxfw000bfiohscrynhr3	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	kese ho	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:20:08.013	2025-07-24 15:20:08.013
cmdhjnc9z000jfioh3r4v2wdo	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	dragon	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:25:07.176	2025-07-24 15:25:07.176
cmdhjnecd000nfioh6rlmwftk	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	hi	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:25:09.853	2025-07-24 15:25:09.853
cmdhjng9y000rfiohnr4mi5lr	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	why	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:25:12.358	2025-07-24 15:25:12.358
cmdhjq8820011fiohzqghao7q	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	k	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:27:21.89	2025-07-24 15:27:21.89
cmdhjqipt0015fiohg3m9i4h4	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	Shared file: Month of June.xlsx	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:27:35.489	2025-07-24 15:27:35.489
cmdhjsm6q001dfiohstjl5d2r	cmdhj4am50000fimhbmjfa66d	cmdg7mg0n000ffi9x0lnmxjzq	hi	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:29:13.298	2025-07-24 15:29:13.298
cmdhjti1d001lfiohncp7nexj	cmdhj4am50000fimhbmjfa66d	cmdg7mg0n000ffi9x0lnmxjzq	okok	TEXT	\N	\N	\N	\N	\N	\N	f	f	2025-07-24 15:29:54.499	2025-07-24 15:29:54.499
\.


--
-- Data for Name: ChatParticipant; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."ChatParticipant" (id, "roomId", "userId", "joinedAt", "lastReadAt", "isActive") FROM stdin;
cmdhj4ame0002fimh1kw9l5ha	cmdhj4am50000fimhbmjfa66d	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:10:18.553	\N	t
cmdhj4ame0003fimhrgzd6lcw	cmdhj4am50000fimhbmjfa66d	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-24 15:10:18.553	\N	t
\.


--
-- Data for Name: ChatRoom; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."ChatRoom" (id, name, description, type, "teamId", "createdAt", "updatedAt") FROM stdin;
cmdhj4am50000fimhbmjfa66d	faizanfarrukh & Kamran Shahid	\N	DIRECT	\N	2025-07-24 15:10:18.555	2025-07-24 15:10:18.555
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Document" (id, "userId", type, name, url, "uploadedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Education; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Education" (id, "userId", degree, institution, field, "startDate", "endDate", grade, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmergencyContact; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."EmergencyContact" (id, "userId", name, relationship, phone, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Experience; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Experience" (id, "userId", company, "position", "startDate", "endDate", description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Hosting; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Hosting" (id, "clientId", domain, cost, "startDate", "expiryDate", "durationType", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Leave; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Leave" (id, "userId", "startDate", "endDate", type, status, reason, "managerId", "adminId", "managerStatus", "adminStatus", "managerComment", "adminComment", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Meeting; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Meeting" (id, "userId", title, "scheduledAt", color, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MessageReadStatus; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."MessageReadStatus" (id, "messageId", "userId", "readAt") FROM stdin;
cmdhjfp7w0003fioh9lwszqqr	cmdhjekc50001fioh6ghlbr2o	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:19:10.694
cmdhjgv4c0009fiohn38klusn	cmdhjgued0007fiohvtxjrull	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:20:05.001
cmdhjgxy1000dfiohcxo6h7k0	cmdhjgxfw000bfiohscrynhr3	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:24:56.64
cmdhjncn1000lfiohu8b4j3a2	cmdhjnc9z000jfioh3r4v2wdo	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:25:07.645
cmdhjnepn000pfiohqpkccfsd	cmdhjnecd000nfioh6rlmwftk	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:25:10.33
cmdhjngml000tfiohn5yjykp3	cmdhjng9y000rfiohnr4mi5lr	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:27:18.747
cmdhjq8wh0013fiohzdrafzge	cmdhjq8820011fiohzqghao7q	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:27:22.769
cmdhjqj430017fiohwvebk3h5	cmdhjqipt0015fiohg3m9i4h4	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:27:36.002
cmdhjsji00019fiohplbygj9j	cmdhjqipt0015fiohg3m9i4h4	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-24 15:29:10.368
cmdhjsnaz001ffiohvxmsi4jm	cmdhjsm6q001dfiohstjl5d2r	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-24 15:29:14.745
cmdhjsyud001hfiohgijsb4ox	cmdhjsm6q001dfiohstjl5d2r	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:29:35.486
cmdhjtk8h001nfiohoanjv9ax	cmdhjti1d001lfiohncp7nexj	cmdhf9zdt0000fi0zevfqomye	2025-07-24 15:29:57.395
cmdhjtk9e001pfioh1hmyhk81	cmdhjti1d001lfiohncp7nexj	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-24 15:29:57.452
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Notification" (id, "userId", message, "timestamp", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Performance; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Performance" (id, "userId", score, month, year, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Permission" (id, name, description, resource, action, "createdAt", "updatedAt") FROM stdin;
cmcm08r450000fif2yo1ogqdp	users.view	View users	users	view	2025-07-02 13:41:02.406	2025-07-02 13:41:02.406
cmcm08r4g0001fif2d9n0fipy	users.create	Create users	users	create	2025-07-02 13:41:02.416	2025-07-02 13:41:02.416
cmcm08r4l0002fif2w5dbpspt	users.edit	Edit users	users	edit	2025-07-02 13:41:02.421	2025-07-02 13:41:02.421
cmcm08r4q0003fif2rdy2r950	users.delete	Delete users	users	delete	2025-07-02 13:41:02.426	2025-07-02 13:41:02.426
cmcm08r4u0004fif228xaqn3g	leaves.view	View leaves	leaves	view	2025-07-02 13:41:02.431	2025-07-02 13:41:02.431
cmcm08r500005fif247cl8rkz	leaves.create	Apply for leave	leaves	create	2025-07-02 13:41:02.436	2025-07-02 13:41:02.436
cmcm08r560006fif2f8xnb2s6	leaves.approve	Approve leaves	leaves	approve	2025-07-02 13:41:02.443	2025-07-02 13:41:02.443
cmcm08r5c0007fif2phgfleys	leaves.reject	Reject leaves	leaves	reject	2025-07-02 13:41:02.448	2025-07-02 13:41:02.448
cmcm08r5h0008fif2ja0ostu3	attendance.view	View attendance	attendance	view	2025-07-02 13:41:02.453	2025-07-02 13:41:02.453
cmcm08r5m0009fif27njwy0ux	attendance.mark	Mark attendance	attendance	mark	2025-07-02 13:41:02.459	2025-07-02 13:41:02.459
cmcm08r5r000afif2a2ze677p	attendance.edit	Edit attendance	attendance	edit	2025-07-02 13:41:02.464	2025-07-02 13:41:02.464
cmcm08r5w000bfif2ihlovaw9	teams.view	View teams	teams	view	2025-07-02 13:41:02.469	2025-07-02 13:41:02.469
cmcm08r61000cfif2qniafjk0	teams.create	Create teams	teams	create	2025-07-02 13:41:02.473	2025-07-02 13:41:02.473
cmcm08r66000dfif2dg3vvezd	teams.edit	Edit teams	teams	edit	2025-07-02 13:41:02.478	2025-07-02 13:41:02.478
cmcm08r6b000efif29bb11r29	teams.delete	Delete teams	teams	delete	2025-07-02 13:41:02.483	2025-07-02 13:41:02.483
cmcm08r6g000ffif2qhz04kx5	reports.view	View reports	reports	view	2025-07-02 13:41:02.489	2025-07-02 13:41:02.489
cmcm08r6n000gfif2mi5i6t8r	dashboard.view	View dashboard	dashboard	view	2025-07-02 13:41:02.495	2025-07-02 13:41:02.495
cmcm08r6u000hfif23s70xj7p	settings.view	View settings	settings	view	2025-07-02 13:41:02.502	2025-07-02 13:41:02.502
cmcm08r71000ifif2hubul66y	settings.edit	Edit settings	settings	edit	2025-07-02 13:41:02.509	2025-07-02 13:41:02.509
cmcm08r78000jfif2o9hg4tjn	roles.view	View roles	roles	view	2025-07-02 13:41:02.517	2025-07-02 13:41:02.517
cmcm08r7f000kfif27mcdfnd3	roles.create	Create roles	roles	create	2025-07-02 13:41:02.524	2025-07-02 13:41:02.524
cmcm08r7n000lfif2nzfknzy4	roles.edit	Edit roles	roles	edit	2025-07-02 13:41:02.531	2025-07-02 13:41:02.531
cmcm08r7u000mfif24agk310n	roles.delete	Delete roles	roles	delete	2025-07-02 13:41:02.538	2025-07-02 13:41:02.538
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Project" (id, name, description, "managerName", "joinDate", "tasksDone", "totalTasks", "timeSpentHours", "totalHours", progress, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectAssignment; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."ProjectAssignment" (id, "projectId", "userId", "assignedAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Role" (id, name, description, "isDefault", "createdAt", "updatedAt") FROM stdin;
cmcm08r85000nfif2i498l1sc	Admin	Administrator with full access	f	2025-07-02 13:41:02.55	2025-07-02 13:41:02.55
cmcm08r8g000ofif2iy7vrwit	Team Leader	Team leader with team management permissions	f	2025-07-02 13:41:02.56	2025-07-02 13:41:02.56
cmcm08r8o000pfif292yrq7th	Employee	Regular employee	t	2025-07-02 13:41:02.568	2025-07-02 13:41:02.568
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."RolePermission" (id, "roleId", "permissionId", "createdAt", "updatedAt") FROM stdin;
cmcm08r8z000rfif2n8tiwth7	cmcm08r85000nfif2i498l1sc	cmcm08r450000fif2yo1ogqdp	2025-07-02 13:41:02.58	2025-07-02 13:41:02.58
cmcm08r98000tfif21go3a0rl	cmcm08r85000nfif2i498l1sc	cmcm08r4g0001fif2d9n0fipy	2025-07-02 13:41:02.588	2025-07-02 13:41:02.588
cmcm08r9e000vfif2551akhkk	cmcm08r85000nfif2i498l1sc	cmcm08r4l0002fif2w5dbpspt	2025-07-02 13:41:02.594	2025-07-02 13:41:02.594
cmcm08r9j000xfif2vlcd1hhq	cmcm08r85000nfif2i498l1sc	cmcm08r4q0003fif2rdy2r950	2025-07-02 13:41:02.599	2025-07-02 13:41:02.599
cmcm08r9p000zfif25wkvkbdh	cmcm08r85000nfif2i498l1sc	cmcm08r4u0004fif228xaqn3g	2025-07-02 13:41:02.605	2025-07-02 13:41:02.605
cmcm08r9v0011fif2zunyqvca	cmcm08r85000nfif2i498l1sc	cmcm08r500005fif247cl8rkz	2025-07-02 13:41:02.611	2025-07-02 13:41:02.611
cmcm08ra00013fif2ev3pl9iy	cmcm08r85000nfif2i498l1sc	cmcm08r560006fif2f8xnb2s6	2025-07-02 13:41:02.617	2025-07-02 13:41:02.617
cmcm08ra60015fif2phd1yfyd	cmcm08r85000nfif2i498l1sc	cmcm08r5c0007fif2phgfleys	2025-07-02 13:41:02.622	2025-07-02 13:41:02.622
cmcm08rac0017fif24yrg44ni	cmcm08r85000nfif2i498l1sc	cmcm08r5h0008fif2ja0ostu3	2025-07-02 13:41:02.628	2025-07-02 13:41:02.628
cmcm08rak0019fif2je8mi00j	cmcm08r85000nfif2i498l1sc	cmcm08r5m0009fif27njwy0ux	2025-07-02 13:41:02.636	2025-07-02 13:41:02.636
cmcm08rar001bfif27olf31ob	cmcm08r85000nfif2i498l1sc	cmcm08r5r000afif2a2ze677p	2025-07-02 13:41:02.644	2025-07-02 13:41:02.644
cmcm08raz001dfif20u2izl2e	cmcm08r85000nfif2i498l1sc	cmcm08r5w000bfif2ihlovaw9	2025-07-02 13:41:02.651	2025-07-02 13:41:02.651
cmcm08rb7001ffif2cr8w7tne	cmcm08r85000nfif2i498l1sc	cmcm08r61000cfif2qniafjk0	2025-07-02 13:41:02.659	2025-07-02 13:41:02.659
cmcm08rbe001hfif2o743jgu8	cmcm08r85000nfif2i498l1sc	cmcm08r66000dfif2dg3vvezd	2025-07-02 13:41:02.666	2025-07-02 13:41:02.666
cmcm08rbm001jfif2wpy07nhg	cmcm08r85000nfif2i498l1sc	cmcm08r6b000efif29bb11r29	2025-07-02 13:41:02.674	2025-07-02 13:41:02.674
cmcm08rbt001lfif2w1de08ln	cmcm08r85000nfif2i498l1sc	cmcm08r6g000ffif2qhz04kx5	2025-07-02 13:41:02.681	2025-07-02 13:41:02.681
cmcm08rc0001nfif2t5ol3hn7	cmcm08r85000nfif2i498l1sc	cmcm08r6n000gfif2mi5i6t8r	2025-07-02 13:41:02.688	2025-07-02 13:41:02.688
cmcm08rc9001pfif2ojnn0q98	cmcm08r85000nfif2i498l1sc	cmcm08r6u000hfif23s70xj7p	2025-07-02 13:41:02.697	2025-07-02 13:41:02.697
cmcm08rcg001rfif21y576ju2	cmcm08r85000nfif2i498l1sc	cmcm08r71000ifif2hubul66y	2025-07-02 13:41:02.705	2025-07-02 13:41:02.705
cmcm08rco001tfif2kl0jdsay	cmcm08r85000nfif2i498l1sc	cmcm08r78000jfif2o9hg4tjn	2025-07-02 13:41:02.712	2025-07-02 13:41:02.712
cmcm08rcv001vfif2rzjl15zh	cmcm08r85000nfif2i498l1sc	cmcm08r7f000kfif27mcdfnd3	2025-07-02 13:41:02.719	2025-07-02 13:41:02.719
cmcm08rd2001xfif2097zqppd	cmcm08r85000nfif2i498l1sc	cmcm08r7n000lfif2nzfknzy4	2025-07-02 13:41:02.727	2025-07-02 13:41:02.727
cmcm08rda001zfif207qk9zf2	cmcm08r85000nfif2i498l1sc	cmcm08r7u000mfif24agk310n	2025-07-02 13:41:02.734	2025-07-02 13:41:02.734
cmcm08rdi0021fif2uvu2gp4c	cmcm08r8g000ofif2iy7vrwit	cmcm08r450000fif2yo1ogqdp	2025-07-02 13:41:02.742	2025-07-02 13:41:02.742
cmcm08rdp0023fif2bdkijxfz	cmcm08r8g000ofif2iy7vrwit	cmcm08r4u0004fif228xaqn3g	2025-07-02 13:41:02.75	2025-07-02 13:41:02.75
cmcm08rdx0025fif2i6q3b555	cmcm08r8g000ofif2iy7vrwit	cmcm08r560006fif2f8xnb2s6	2025-07-02 13:41:02.757	2025-07-02 13:41:02.757
cmcm08re40027fif2c1d0mu85	cmcm08r8g000ofif2iy7vrwit	cmcm08r5c0007fif2phgfleys	2025-07-02 13:41:02.764	2025-07-02 13:41:02.764
cmcm08reb0029fif2902435a8	cmcm08r8g000ofif2iy7vrwit	cmcm08r5h0008fif2ja0ostu3	2025-07-02 13:41:02.772	2025-07-02 13:41:02.772
cmcm08rek002bfif22x6ns6zg	cmcm08r8g000ofif2iy7vrwit	cmcm08r5m0009fif27njwy0ux	2025-07-02 13:41:02.78	2025-07-02 13:41:02.78
cmcm08ret002dfif2gpj88lnp	cmcm08r8g000ofif2iy7vrwit	cmcm08r5r000afif2a2ze677p	2025-07-02 13:41:02.789	2025-07-02 13:41:02.789
cmcm08rf1002ffif2e9pn5vqe	cmcm08r8g000ofif2iy7vrwit	cmcm08r5w000bfif2ihlovaw9	2025-07-02 13:41:02.797	2025-07-02 13:41:02.797
cmcm08rf9002hfif2cm3po7om	cmcm08r8g000ofif2iy7vrwit	cmcm08r6g000ffif2qhz04kx5	2025-07-02 13:41:02.805	2025-07-02 13:41:02.805
cmcm08rfh002jfif26mqc7zx7	cmcm08r8g000ofif2iy7vrwit	cmcm08r6n000gfif2mi5i6t8r	2025-07-02 13:41:02.813	2025-07-02 13:41:02.813
cmcm08rfo002lfif2lnpp2hd9	cmcm08r8o000pfif292yrq7th	cmcm08r4u0004fif228xaqn3g	2025-07-02 13:41:02.821	2025-07-02 13:41:02.821
cmcm08rfw002nfif256ks0nti	cmcm08r8o000pfif292yrq7th	cmcm08r500005fif247cl8rkz	2025-07-02 13:41:02.828	2025-07-02 13:41:02.828
cmcm08rg3002pfif2fr9a6k5d	cmcm08r8o000pfif292yrq7th	cmcm08r5h0008fif2ja0ostu3	2025-07-02 13:41:02.836	2025-07-02 13:41:02.836
cmcm08rgb002rfif2l5hbcmne	cmcm08r8o000pfif292yrq7th	cmcm08r5m0009fif27njwy0ux	2025-07-02 13:41:02.843	2025-07-02 13:41:02.843
cmcm08rgj002tfif2u9xzq9fc	cmcm08r8o000pfif292yrq7th	cmcm08r5w000bfif2ihlovaw9	2025-07-02 13:41:02.851	2025-07-02 13:41:02.851
cmcm08rgq002vfif2hleoxk4r	cmcm08r8o000pfif292yrq7th	cmcm08r6n000gfif2mi5i6t8r	2025-07-02 13:41:02.858	2025-07-02 13:41:02.858
\.


--
-- Data for Name: Skill; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Skill" (id, name, level, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Task" (id, title, description, status, priority, "dueDate", "assignedTo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."Team" (id, name, description, "leaderId", "createdAt", "updatedAt") FROM stdin;
cmdhfzx880001fi361lmsi89t	Production	Mize Technologies Production Team	cmdg7mg0n000ffi9x0lnmxjzq	2025-07-24 13:42:55.732	2025-07-24 13:42:55.732
cmdhg1p8g000dfi36oqs269f3	Sales Team	Mize Technologies Sales Team	cmdhf9zdt0000fi0zevfqomye	2025-07-24 13:44:18.689	2025-07-24 13:54:03.998
\.


--
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."TeamMember" (id, "teamId", "userId", "joinedAt") FROM stdin;
cmdhfzx8l0003fi36gn72xy0y	cmdhfzx880001fi361lmsi89t	cmdg7mdsy0006fi9x6vdw91re	2025-07-24 13:42:55.749
cmdhfzx8m0005fi36zdmoooms	cmdhfzx880001fi361lmsi89t	cmdg7mfax000cfi9xmhek342g	2025-07-24 13:42:55.749
cmdhfzx8x0007fi363coxad6y	cmdhfzx880001fi361lmsi89t	cmdg7mczw0003fi9xa53xjuqy	2025-07-24 13:42:55.75
cmdhfzx8y000afi36bfaoebep	cmdhfzx880001fi361lmsi89t	cmdg7mekt0009fi9xq0jez3n6	2025-07-24 13:42:55.749
cmdhfzx8z000bfi36mbtz13r9	cmdhfzx880001fi361lmsi89t	cmdg7mc8d0000fi9xjjn2sq2y	2025-07-24 13:42:55.749
cmdhge8ue000kfi365upmebwj	cmdhg1p8g000dfi36oqs269f3	cmdhf9zdt0000fi0zevfqomye	2025-07-24 13:54:03.972
cmdhge8uf000lfi36phdd2tjf	cmdhg1p8g000dfi36oqs269f3	cmdg7mgpt000ifi9xhbw7rjg3	2025-07-24 13:54:03.973
cmdhge8uf000mfi36050zwd1b	cmdhg1p8g000dfi36oqs269f3	cmdg7mhfv000lfi9xgle1ozjd	2025-07-24 13:54:03.973
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."User" (id, username, "firstName", "lastName", email, cnic, pfp, password, salary, address, department, "position", "joinDate", phone, role, status, "dateOfBirth", gender, "maritalStatus", "reportsToId", image, "createdAt", "updatedAt") FROM stdin;
cmdg7mg0n000ffi9x0lnmxjzq	kamran.shahid	Kamran	Shahid	kamran.shahid@company.com	35401-6789012-6	\N	$2b$12$rqRWy1gqG5CT4fBERg81NuSj0Fu2nmtyv8m/WlEMmMeBexC/9UaFe	58000	987 Digital Valley, Islamabad	Development	Backend Developer	2023-12-05 00:00:00	+92-300-6789012	EMPLOYEE	ACTIVE	\N	\N	\N	\N	\N	2025-07-23 17:00:43.799	2025-07-23 17:00:43.799
cmdg7mdsy0006fi9x6vdw91re	rahat.jawaid	Rahat	Jawaid	rahat.jawaid@company.com	35401-3456789-3	\N	$2b$12$R0CkKDNqXv/254r5bOkTuuLo.JSmXqSudmxR.OZoB4IlnWllxrPdS	60000	789 Tech Hub, Islamabad	Development	Lead Developer	2023-08-10 00:00:00	+92-300-3456789	EMPLOYEE	ACTIVE	\N	\N	\N	cmdg7mg0n000ffi9x0lnmxjzq	\N	2025-07-23 17:00:40.93	2025-07-24 13:42:55.76
cmdg7mfax000cfi9xmhek342g	kavish.asif	Kavish	Asif	kavish.asif@company.com	35401-5678901-5	\N	$2b$12$rbIFNnkho6gYMEBPAdvxieOiRXL/4fJxmZJ4UnNDhkGmo.mQ1zBly	52000	654 Software Park, Lahore	Development	Full Stack Developer	2024-03-12 00:00:00	+92-300-5678901	EMPLOYEE	ACTIVE	\N	\N	\N	cmdg7mg0n000ffi9x0lnmxjzq	\N	2025-07-23 17:00:42.873	2025-07-24 13:42:55.764
cmdg7mczw0003fi9xa53xjuqy	muhammad.sharique	Muhammad	Sharique	muhammad.sharique@company.com	35401-2345678-2	\N	$2b$12$WPXk8MudwAVkAvhkw/dMKujPK1gyzmXprr0qnFBiuuUFOjNjrGS0u	55000	456 Business District, Lahore	Development	Senior Developer	2023-11-20 00:00:00	+92-300-2345678	EMPLOYEE	ACTIVE	\N	\N	\N	cmdg7mg0n000ffi9x0lnmxjzq	\N	2025-07-23 17:00:39.884	2025-07-24 13:42:55.77
cmdg7mc8d0000fi9xjjn2sq2y	hamza.qureshi	Hamza	Qureshi	hamza.qureshi@company.com	35401-1234567-1	\N	$2b$12$mf2nzNoPJDCYR2BYRlL6Qeo/ndqfRmb1c3Icg2Z0DoABR8136n8Eq	50000	123 Main Street, Karachi	Development	Software Engineer	2024-01-15 00:00:00	+92-300-1234567	EMPLOYEE	ACTIVE	\N	\N	\N	cmdg7mg0n000ffi9x0lnmxjzq	\N	2025-07-23 17:00:38.891	2025-07-24 13:42:55.772
cmdg7mekt0009fi9xq0jez3n6	zohaib.hussain	Zohaib	Hussain	zohaib.hussain@company.com	35401-4567890-4	\N	$2b$12$n.xBN86hl1lPnp6z5dtHceHk1rDo0hhTtiMUDdySIZWfXZd6HijYO	48000	321 Innovation Center, Karachi	Development	Frontend Developer	2024-02-01 00:00:00	+92-300-4567890	EMPLOYEE	ACTIVE	\N	\N	\N	cmdg7mg0n000ffi9x0lnmxjzq	\N	2025-07-23 17:00:41.934	2025-07-24 13:42:55.773
cmdg7mgpt000ifi9xhbw7rjg3	muhammad.azan	Muhammad	Azan	muhammad.azan@company.com	35401-7890123-7	\N	$2b$12$xygWcbbo/lkPQBmvYk.NdO1B2yNPoXAk8l8daaG3.1zynwpup9Xwy	45000	159 Code Street, Karachi	Development	Junior Developer	2024-04-20 00:00:00	+92-300-7890123	EMPLOYEE	ACTIVE	\N	\N	\N	cmdhf9zdt0000fi0zevfqomye	\N	2025-07-23 17:00:44.706	2025-07-24 13:54:03.983
cmdg7mhfv000lfi9xgle1ozjd	muhammad.uzair	Muhammad	Uzair	muhammad.uzair@company.com	35401-8901234-8	\N	$2b$12$DkwTtadoJUr8lpxFrlviAuafWmcP3EX4Az0sAuwb1pRbZo4ETsqaa	47000	753 Tech City, Lahore	Development	Mobile Developer	2024-01-30 00:00:00	+92-300-8901234	EMPLOYEE	ACTIVE	\N	\N	\N	cmdhf9zdt0000fi0zevfqomye	\N	2025-07-23 17:00:45.643	2025-07-24 13:54:03.983
cmdhf9zdt0000fi0zevfqomye	faizanfarrukh	FAIZAN	FARRUKH	faizanfarrukh@mizetechnologies.com	00001-3310534-7	\N	$2b$12$sfWj809j8Kf2UnZ.UKJI6.g8xcXrbl7Myz9vRKb0jk17erm4k7ZBy	50000	Default Address	Mize Technologies	Employee	2025-01-01 00:00:00	\N	ADMIN	ACTIVE	\N	MALE	\N	cmdhf9zdt0000fi0zevfqomye	\N	2025-07-24 13:22:45.473	2025-07-24 13:54:03.983
\.


--
-- Data for Name: UserLastSeen; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."UserLastSeen" (id, "userId", "lastSeen", "isOnline") FROM stdin;
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: salad
--

COPY public."UserRole" (id, "userId", "roleId", "createdAt", "updatedAt") FROM stdin;
cmdg7mc8e0002fi9xtfm45yec	cmdg7mc8d0000fi9xjjn2sq2y	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:38.891	2025-07-23 17:00:38.891
cmdg7mczw0005fi9x7ypsbp2g	cmdg7mczw0003fi9xa53xjuqy	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:39.884	2025-07-23 17:00:39.884
cmdg7mdsy0008fi9xrqnbyccd	cmdg7mdsy0006fi9x6vdw91re	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:40.93	2025-07-23 17:00:40.93
cmdg7mekt000bfi9xi4kci6cj	cmdg7mekt0009fi9xq0jez3n6	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:41.934	2025-07-23 17:00:41.934
cmdg7mfax000efi9xrvcx92po	cmdg7mfax000cfi9xmhek342g	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:42.873	2025-07-23 17:00:42.873
cmdg7mg0n000hfi9xmiu7vkhu	cmdg7mg0n000ffi9x0lnmxjzq	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:43.799	2025-07-23 17:00:43.799
cmdg7mgpu000kfi9xgzggzwqu	cmdg7mgpt000ifi9xhbw7rjg3	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:44.706	2025-07-23 17:00:44.706
cmdg7mhfv000nfi9xn4aclfky	cmdg7mhfv000lfi9xgle1ozjd	cmcm08r8o000pfif292yrq7th	2025-07-23 17:00:45.643	2025-07-23 17:00:45.643
cmdhf9zee0002fi0z0frudvab	cmdhf9zdt0000fi0zevfqomye	cmcm08r85000nfif2i498l1sc	2025-07-24 13:22:45.494	2025-07-24 13:22:45.494
\.


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: BankDetails BankDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."BankDetails"
    ADD CONSTRAINT "BankDetails_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatParticipant ChatParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY (id);


--
-- Name: ChatRoom ChatRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Education Education_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_pkey" PRIMARY KEY (id);


--
-- Name: EmergencyContact EmergencyContact_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."EmergencyContact"
    ADD CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY (id);


--
-- Name: Experience Experience_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Experience"
    ADD CONSTRAINT "Experience_pkey" PRIMARY KEY (id);


--
-- Name: Hosting Hosting_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Hosting"
    ADD CONSTRAINT "Hosting_pkey" PRIMARY KEY (id);


--
-- Name: Leave Leave_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Leave"
    ADD CONSTRAINT "Leave_pkey" PRIMARY KEY (id);


--
-- Name: Meeting Meeting_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Meeting"
    ADD CONSTRAINT "Meeting_pkey" PRIMARY KEY (id);


--
-- Name: MessageReadStatus MessageReadStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."MessageReadStatus"
    ADD CONSTRAINT "MessageReadStatus_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Performance Performance_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Performance"
    ADD CONSTRAINT "Performance_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: ProjectAssignment ProjectAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ProjectAssignment"
    ADD CONSTRAINT "ProjectAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Skill Skill_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Skill"
    ADD CONSTRAINT "Skill_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- Name: UserLastSeen UserLastSeen_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."UserLastSeen"
    ADD CONSTRAINT "UserLastSeen_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Attendance_userId_date_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "Attendance_userId_date_key" ON public."Attendance" USING btree ("userId", date);


--
-- Name: BankDetails_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "BankDetails_userId_key" ON public."BankDetails" USING btree ("userId");


--
-- Name: ChatParticipant_roomId_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "ChatParticipant_roomId_userId_key" ON public."ChatParticipant" USING btree ("roomId", "userId");


--
-- Name: EmergencyContact_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "EmergencyContact_userId_key" ON public."EmergencyContact" USING btree ("userId");


--
-- Name: MessageReadStatus_messageId_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "MessageReadStatus_messageId_userId_key" ON public."MessageReadStatus" USING btree ("messageId", "userId");


--
-- Name: Permission_name_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "Permission_name_key" ON public."Permission" USING btree (name);


--
-- Name: Permission_resource_action_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "Permission_resource_action_key" ON public."Permission" USING btree (resource, action);


--
-- Name: RolePermission_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON public."RolePermission" USING btree ("roleId", "permissionId");


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: TeamMember_teamId_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON public."TeamMember" USING btree ("teamId", "userId");


--
-- Name: UserLastSeen_userId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "UserLastSeen_userId_key" ON public."UserLastSeen" USING btree ("userId");


--
-- Name: UserRole_userId_roleId_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON public."UserRole" USING btree ("userId", "roleId");


--
-- Name: User_cnic_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "User_cnic_key" ON public."User" USING btree (cnic);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: salad
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Attendance Attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BankDetails BankDetails_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."BankDetails"
    ADD CONSTRAINT "BankDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_parentMessageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES public."ChatMessage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ChatMessage ChatMessage_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatParticipant ChatParticipant_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."ChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatParticipant ChatParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatRoom ChatRoom_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Education Education_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmergencyContact EmergencyContact_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."EmergencyContact"
    ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Experience Experience_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Experience"
    ADD CONSTRAINT "Experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Hosting Hosting_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Hosting"
    ADD CONSTRAINT "Hosting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Leave Leave_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Leave"
    ADD CONSTRAINT "Leave_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Leave Leave_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Leave"
    ADD CONSTRAINT "Leave_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Leave Leave_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Leave"
    ADD CONSTRAINT "Leave_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Meeting Meeting_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Meeting"
    ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MessageReadStatus MessageReadStatus_messageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."MessageReadStatus"
    ADD CONSTRAINT "MessageReadStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES public."ChatMessage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Performance Performance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Performance"
    ADD CONSTRAINT "Performance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAssignment ProjectAssignment_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ProjectAssignment"
    ADD CONSTRAINT "ProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAssignment ProjectAssignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."ProjectAssignment"
    ADD CONSTRAINT "ProjectAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Skill Skill_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Skill"
    ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeamMember TeamMember_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeamMember TeamMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Team Team_leaderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserLastSeen UserLastSeen_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."UserLastSeen"
    ADD CONSTRAINT "UserLastSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_reportsToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: salad
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

