import discord
from discord.ext import commands
from config import DISCORD_TOKEN, CHANNEL_ID, GUILD_ID
import asyncio

class DiscordBot:
    def __init__(self):
        intents = discord.Intents.default()
        intents.guilds = True
        self.bot = commands.Bot(command_prefix="!", intents=intents)
        self._ready = asyncio.Event()
        self.setup()

    def setup(self):
        @self.bot.event
        async def on_ready():
            print(f'{self.bot.user} has connected to Discord!')
            self._ready.set()

    async def send_complaint(self, officer_id: str, officer_name: str, complaint_data: dict):
        await self._ready.wait()
        
        try:
            channel = self.bot.get_channel(CHANNEL_ID)
            if not channel:
                raise Exception(f"Could not find channel with ID {CHANNEL_ID}")
            
            # Create the main embed
            embed = discord.Embed(
                title="═══ PERSONNEL INCIDENT REPORT ═══",
                color=0x3282B8,  # Modern blue color
                timestamp=discord.utils.utcnow()
            )
            
            # Add header
            embed.add_field(
                name="═══ CLASSIFICATION ═══",
                value="```OFFICIAL USE ONLY```",
                inline=False
            )
            
            # Add report number and timestamp
            report_number = f"IR-{int(discord.utils.utcnow().timestamp())}"
            embed.add_field(
                name="REPORT DETAILS",
                value=f"```\nReport Number: {report_number}\nSubmitted: {discord.utils.format_dt(discord.utils.utcnow(), style='F')}```",
                inline=False
            )
            
            # Add subject officer
            embed.add_field(
                name="SUBJECT PERSONNEL",
                value=f"```\nOfficer: {officer_name}\nID: {officer_id}```",
                inline=False
            )
            
            # Add incident details
            if isinstance(complaint_data, dict):
                incident_details = (
                    f"```\n"
                    f"Type: {complaint_data.get('misconductType', 'N/A')}\n"
                    f"Date: {complaint_data.get('incidentDate', 'N/A')}\n"
                    f"Location: {complaint_data.get('location', 'N/A')}\n"
                    f"```"
                )
                embed.add_field(name="INCIDENT DETAILS", value=incident_details, inline=False)
                
                if complaint_data.get('witnesses'):
                    embed.add_field(
                        name="WITNESSES",
                        value=f"```{complaint_data['witnesses']}```",
                        inline=False
                    )
                
                embed.add_field(
                    name="DETAILED REPORT",
                    value=f"```{complaint_data.get('complaint', 'N/A')}```",
                    inline=False
                )
                
                if complaint_data.get('evidence'):
                    embed.add_field(
                        name="SUPPORTING EVIDENCE",
                        value=f"```{complaint_data['evidence']}```",
                        inline=False
                    )
            
            # Add footer
            embed.set_footer(text=f"Report ID: {report_number} • CONFIDENTIAL")
            
            # Send only the embed, no separators
            await channel.send(embed=embed)
            
            print(f"Successfully sent report {report_number} for officer: {officer_name}")
            
        except Exception as e:
            print(f"Error sending report: {e}")
            raise

    def run(self):
        self.bot.run(DISCORD_TOKEN)