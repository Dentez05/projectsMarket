using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Store.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RepliedAt",
                table: "support_tickets",
                newName: "UserLastReadAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "AdminLastReadAt",
                table: "support_tickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMessageAt",
                table: "support_tickets",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "support_messages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TicketId = table.Column<int>(type: "integer", nullable: false),
                    SenderId = table.Column<int>(type: "integer", nullable: false),
                    SenderRole = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SenderName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_support_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_support_messages_support_tickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "support_tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_LastMessageAt",
                table: "support_tickets",
                column: "LastMessageAt");

            migrationBuilder.CreateIndex(
                name: "IX_support_messages_TicketId",
                table: "support_messages",
                column: "TicketId");

            // Перенос существующих обращений в чат: первое сообщение пользователя...
            migrationBuilder.Sql(@"
                INSERT INTO support_messages (""TicketId"", ""SenderId"", ""SenderRole"", ""SenderName"", ""Body"", ""CreatedAt"")
                SELECT ""Id"", ""UserId"", 'User', COALESCE(NULLIF(""UserName"", ''), 'Пользователь'), ""Message"", ""CreatedAt""
                FROM support_tickets;
            ");

            // ...и ответ поддержки (если был), с прежних колонок AdminReply/RepliedAt.
            migrationBuilder.Sql(@"
                INSERT INTO support_messages (""TicketId"", ""SenderId"", ""SenderRole"", ""SenderName"", ""Body"", ""CreatedAt"")
                SELECT ""Id"", 0, 'Admin', 'Поддержка', ""AdminReply"", COALESCE(""UserLastReadAt"", ""CreatedAt"")
                FROM support_tickets
                WHERE ""AdminReply"" IS NOT NULL;
            ");

            // LastMessageAt и метки прочтения для старых данных.
            migrationBuilder.Sql(@"
                UPDATE support_tickets SET ""LastMessageAt"" = COALESCE(""UserLastReadAt"", ""CreatedAt"");
            ");

            migrationBuilder.Sql(@"
                UPDATE support_tickets SET ""AdminLastReadAt"" = ""UserLastReadAt""
                WHERE ""UserLastReadAt"" IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "support_tickets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "support_tickets",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE support_tickets t SET ""AdminReply"" = (
                    SELECT m.""Body"" FROM support_messages m
                    WHERE m.""TicketId"" = t.""Id"" AND m.""SenderRole"" = 'Admin'
                    ORDER BY m.""CreatedAt"" DESC
                    LIMIT 1
                );
            ");

            migrationBuilder.DropTable(
                name: "support_messages");

            migrationBuilder.DropIndex(
                name: "IX_support_tickets_LastMessageAt",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "AdminLastReadAt",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "LastMessageAt",
                table: "support_tickets");

            migrationBuilder.RenameColumn(
                name: "UserLastReadAt",
                table: "support_tickets",
                newName: "RepliedAt");
        }
    }
}
